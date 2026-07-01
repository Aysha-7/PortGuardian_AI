import { useState, useCallback } from 'react';
import type { ScanScenario, ScanResult, ScanState } from '../types';

const API_URL = 'http://127.0.0.1:8000/api/scan';

// Normalise whatever the backend sends into a consistent ScanResult shape.
// FastAPI backends sometimes return raw data without a status wrapper, or
// return ai_reasoning as a plain string instead of an array.
function normalise(raw: Record<string, unknown>): ScanResult {
  const reasoning = raw.ai_reasoning;
  const ai_reasoning: string[] = Array.isArray(reasoning)
    ? (reasoning as string[])
    : typeof reasoning === 'string' && reasoning.length > 0
      ? (reasoning as string).split('\n').filter(Boolean)
      : [];

  const verdict = (() => {
    const v = String(raw.verdict ?? '').toUpperCase();
    if (v === 'SAFE') return 'SAFE' as const;
    if (v === 'SUSPICIOUS') return 'SUSPICIOUS' as const;
    return 'MALICIOUS' as const;
  })();

  return {
    status: 'success',
    verdict,
    ai_reasoning,
    user_report: String(raw.user_report ?? raw.report ?? ''),
    threat_score:
      typeof raw.threat_score === 'number' ? raw.threat_score : undefined,
    blocked: typeof raw.blocked === 'boolean' ? raw.blocked : undefined,
    attack_type: typeof raw.attack_type === 'string' ? raw.attack_type : undefined,
    source: typeof raw.source === 'string' ? raw.source : undefined,
    target: typeof raw.target === 'string' ? raw.target : undefined,
  };
}

export function useScan() {
  const [state, setState] = useState<ScanState>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (scenario: ScanScenario) => {
    setState('scanning');
    setResult(null);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const raw: Record<string, unknown> = await res.json();

      // Accept either a wrapped { status, ...} envelope or a bare payload
      if (raw.status === 'error') {
        throw new Error(String(raw.message ?? raw.detail ?? 'Backend returned error'));
      }

      const data = normalise(raw);
      setResult(data);
      setState('done');
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  return { state, result, error, scan, reset };
}
