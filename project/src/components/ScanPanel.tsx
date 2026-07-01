import { useState } from 'react';
import {
  ScanLine,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  RotateCcw,
  Plug,
  ChevronRight,
} from 'lucide-react';
import { SCAN_SCENARIOS, type ScanScenario, type ScanState, type ScanResult } from '../types';

interface ScanPanelProps {
  state: ScanState;
  result: ScanResult | null;
  error: string | null;
  onScan: (scenario: ScanScenario) => void;
  onReset: () => void;
}

const SCENARIO_LABELS: Record<ScanScenario, string> = {
  JUICE_JACKING_DATA: 'Juice Jacking — Data Exfiltration',
  JUICE_JACKING_MALWARE: 'Juice Jacking — Malware Implant',
  DMA_ATTACK: 'DMA Attack',
  FIRMWARE_ROOTKIT: 'Firmware Rootkit',
  SIDE_CHANNEL_LEAK: 'Side-Channel Timing Leak',
  USB_RUBBER_DUCKY: 'USB Rubber Ducky (HID Injection)',
  PCIE_SPOOFING: 'PCIe Controller Spoofing',
  JTAG_UNLOCK: 'JTAG Interface Unlock',
  THUNDERBOLT_DMA: 'Thunderbolt DMA Hijack',
  I2C_SNIFFING: 'I2C Bus Sniffing',
  SAFE_DEVICE: 'Safe Device (Baseline)',
};

// Group scenarios for a cleaner dropdown
const SCENARIO_GROUPS: { label: string; items: ScanScenario[] }[] = [
  { label: 'USB / Peripheral', items: ['JUICE_JACKING_DATA', 'JUICE_JACKING_MALWARE', 'USB_RUBBER_DUCKY'] },
  { label: 'Memory / DMA', items: ['DMA_ATTACK', 'THUNDERBOLT_DMA'] },
  { label: 'Firmware / Hardware', items: ['FIRMWARE_ROOTKIT', 'JTAG_UNLOCK', 'PCIE_SPOOFING', 'I2C_SNIFFING'] },
  { label: 'Side Channel', items: ['SIDE_CHANNEL_LEAK'] },
  { label: 'Baseline', items: ['SAFE_DEVICE'] },
];

const VERDICT_CFG: Record<
  'SAFE' | 'MALICIOUS' | 'SUSPICIOUS',
  { icon: typeof ShieldCheck; label: string; color: string; border: string; bg: string; glow: string; bar: string }
> = {
  SAFE: {
    icon: ShieldCheck,
    label: 'SAFE',
    color: 'text-neon-green',
    border: 'border-neon-green/50',
    bg: 'bg-neon-green/5',
    glow: 'shadow-glow-green',
    bar: 'bg-neon-green',
  },
  SUSPICIOUS: {
    icon: AlertTriangle,
    label: 'SUSPICIOUS',
    color: 'text-neon-amber',
    border: 'border-neon-amber/50',
    bg: 'bg-neon-amber/5',
    glow: 'shadow-glow-amber',
    bar: 'bg-neon-amber',
  },
  MALICIOUS: {
    icon: ShieldAlert,
    label: 'MALICIOUS',
    color: 'text-neon-red',
    border: 'border-neon-red/60',
    bg: 'bg-neon-red/5',
    glow: 'shadow-glow-red',
    bar: 'bg-neon-red',
  },
};

const AGENT_STEPS = [
  'Probing hardware attack surface...',
  'Querying IOMMU isolation state...',
  'Verifying TPM attestation chain...',
  'Running USB-GUARD descriptor analysis...',
  'AI.CORE reasoning over threat signatures...',
  'Compiling multi-agent verdict...',
];

export default function ScanPanel({ state, result, error, onScan, onReset }: ScanPanelProps) {
  const [selected, setSelected] = useState<ScanScenario>('JUICE_JACKING_DATA');
  const [agentStep, setAgentStep] = useState(0);
  const isScanning = state === 'scanning';

  // Cycle through agent step labels while scanning
  const startAgentCycle = () => {
    setAgentStep(0);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 1, AGENT_STEPS.length - 1);
      setAgentStep(i);
      if (i >= AGENT_STEPS.length - 1) clearInterval(id);
    }, 900);
  };

  const handleScan = () => {
    startAgentCycle();
    onScan(selected);
  };

  const vcfg = result ? VERDICT_CFG[result.verdict] : null;
  const VerdictIcon = vcfg?.icon ?? ShieldCheck;

  return (
    <div className="bracket-corners relative overflow-hidden rounded-md border border-neon-green/30 bg-ink-850/70 shadow-glow-green/20 backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <ScanLine className="h-4 w-4 text-neon-green" />
          <h2 className="font-display text-xs font-bold tracking-[0.22em] text-slate-200">
            HARDWARE SCAN // MULTI-AGENT ANALYSIS
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] text-ink-500 md:block">
            Target: <span className="text-slate-400">ngrok-free.app/api/scan</span>
          </span>
          {state !== 'idle' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded border border-ink-600/70 bg-ink-800/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink-500 transition-colors hover:border-ink-500 hover:text-slate-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Scenario selector + action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-ink-500">
              Select Attack Scenario
            </label>
            <div className="relative">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value as ScanScenario)}
                disabled={isScanning}
                className="w-full appearance-none rounded border border-ink-600/70 bg-ink-900 px-3.5 py-3 font-mono text-sm text-slate-200 outline-none ring-0 transition-colors hover:border-ink-500 focus:border-neon-green/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SCENARIO_GROUPS.map((g) => (
                  <optgroup key={g.label} label={`── ${g.label} ──`}>
                    {g.items.map((s) => (
                      <option key={s} value={s}>
                        {SCENARIO_LABELS[s]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            </div>
            <p className="font-mono text-[10px] text-ink-600">
              Payload: <span className="text-ink-500">POST</span>{' '}
              <span className="text-neon-cyan/70">{'{ "scenario": "'}</span>
              <span className="text-neon-green">{selected}</span>
              <span className="text-neon-cyan/70">{'" }'}</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex shrink-0 gap-2">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`relative flex items-center justify-center gap-2 overflow-hidden rounded border px-6 py-3 font-display text-xs font-bold tracking-[0.22em] transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                isScanning
                  ? 'border-neon-green/30 bg-neon-green/5 text-neon-green'
                  : 'border-neon-green/60 bg-neon-green/10 text-neon-green shadow-glow-green hover:bg-neon-green/20'
              }`}
            >
              {isScanning && (
                <span className="pointer-events-none absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent animate-sweep" />
              )}
              <ScanLine className={`h-4 w-4 ${isScanning ? 'animate-pulse' : ''}`} />
              {isScanning ? 'SCANNING...' : 'SCAN'}
            </button>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`relative flex items-center justify-center gap-2 overflow-hidden rounded border px-6 py-3 font-display text-xs font-bold tracking-[0.22em] transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                isScanning
                  ? 'border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan'
                  : 'border-neon-cyan/50 bg-neon-cyan/8 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/70'
              }`}
            >
              <Plug className={`h-4 w-4 ${isScanning ? 'animate-pulse' : ''}`} />
              CONNECT
            </button>
          </div>
        </div>

        {/* Scanning progress */}
        {isScanning && (
          <div className="mt-4 rounded border border-neon-green/20 bg-ink-950/60 p-4">
            <div className="mb-2 flex items-center justify-between text-[10px]">
              <span className="uppercase tracking-widest text-ink-500">Multi-Agent Analysis Pipeline</span>
              <span className="text-neon-green animate-pulse">RUNNING</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700/70">
              <div
                className="h-full rounded-full bg-neon-green transition-all duration-700"
                style={{ width: `${((agentStep + 1) / AGENT_STEPS.length) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-neon-green/80">
              <ChevronRight className="h-3 w-3 animate-pulse" />
              {AGENT_STEPS[agentStep]}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {['IOMMU', 'TPM', 'USB-GUARD', 'FW-VERIFY', 'AI.CORE'].map((agent, i) => (
                <span
                  key={agent}
                  className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                    i <= agentStep
                      ? 'border border-neon-green/40 bg-neon-green/10 text-neon-green'
                      : 'border border-ink-700/60 text-ink-600'
                  }`}
                >
                  {agent}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && error && (
          <div className="mt-4 flex items-start gap-3 rounded border border-neon-red/40 bg-neon-red/5 px-4 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-neon-red" />
            <div>
              <div className="font-display text-xs font-bold tracking-wider text-neon-red">
                BACKEND UNREACHABLE
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-ink-500 break-all">{error}</div>
              <div className="mt-1.5 text-[11px] text-ink-500">
                Ensure the ngrok tunnel is active and forwarding to your FastAPI server.
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'done' && result && vcfg && (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Verdict card */}
            <div className={`rounded border ${vcfg.border} ${vcfg.bg} ${vcfg.glow} p-4`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border ${vcfg.border} ${vcfg.bg}`}
                >
                  <VerdictIcon className={`h-6 w-6 ${vcfg.color}`} strokeWidth={2} />
                </div>
                <div>
                  <div className={`font-display text-base font-extrabold tracking-[0.22em] ${vcfg.color}`}>
                    {vcfg.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-500">
                    {SCENARIO_LABELS[selected]}
                  </div>
                  {result.threat_score != null && (
                    <div className="mt-1.5">
                      <div className="mb-1 flex items-center justify-between text-[10px] text-ink-500">
                        <span>Threat Score</span>
                        <span className={vcfg.color}>{result.threat_score}/100</span>
                      </div>
                      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ink-700/70">
                        <div
                          className={`h-full rounded-full ${vcfg.bar} transition-all duration-700`}
                          style={{ width: `${result.threat_score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {result.user_report && (
                <div className="mt-3 border-t border-ink-700/60 pt-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-500">
                    <FileText className="h-3 w-3" />
                    Report
                  </div>
                  <p className="font-mono text-[11.5px] leading-relaxed text-slate-300">
                    {result.user_report}
                  </p>
                </div>
              )}
            </div>

            {/* AI reasoning chain */}
            {result.ai_reasoning.length > 0 && (
              <div className="flex flex-col overflow-hidden rounded border border-ink-700/60 bg-ink-950/70">
                <div className="flex items-center justify-between border-b border-ink-700/60 px-3 py-2">
                  <span className="font-display text-[10px] font-bold tracking-[0.18em] text-slate-400">
                    AI REASONING CHAIN
                  </span>
                  <span className="font-mono text-[10px] text-ink-500">
                    {result.ai_reasoning.length} steps
                  </span>
                </div>
                <div className="thin-scroll flex-1 overflow-y-auto px-3 py-2.5 font-mono text-[11px] leading-relaxed">
                  {result.ai_reasoning.map((line, i) => (
                    <div key={i} className="flex gap-2.5 py-0.5">
                      <span className="shrink-0 tabular-nums text-ink-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-neon-cyan/50" />
                      <span
                        className={
                          result.verdict === 'MALICIOUS'
                            ? 'text-neon-red/90'
                            : result.verdict === 'SUSPICIOUS'
                              ? 'text-neon-amber/90'
                              : 'text-slate-300'
                        }
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
