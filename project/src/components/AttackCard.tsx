import { ShieldCheck, ShieldAlert, Zap, Crosshair } from 'lucide-react';
import type { AttackEvent } from '../types';

interface AttackCardProps {
  attack: AttackEvent;
}

const SEVERITY: Record<AttackEvent['severity'], { color: string; ring: string; label: string }> = {
  low: { color: 'text-neon-cyan', ring: 'border-neon-cyan/40', label: 'LOW' },
  medium: { color: 'text-neon-amber', ring: 'border-neon-amber/40', label: 'MED' },
  high: { color: 'text-neon-red', ring: 'border-neon-red/50', label: 'HIGH' },
  critical: { color: 'text-neon-red', ring: 'border-neon-red/70', label: 'CRIT' },
};

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

export default function AttackCard({ attack }: AttackCardProps) {
  const sev = SEVERITY[attack.severity];
  const blocked = attack.blocked;

  return (
    <div
      className={`relative overflow-hidden rounded-md border ${sev.ring} bg-ink-850/80 px-3.5 py-3 shadow-inset-line`}
    >
      {/* sweep highlight for active (unblocked) attacks */}
      {!blocked && (
        <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-neon-red/10 to-transparent animate-sweep" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded border ${
              blocked ? 'border-neon-green/40 bg-neon-green/5' : 'border-neon-red/50 bg-neon-red/5'
            }`}
          >
            {blocked ? (
              <ShieldCheck className="h-4 w-4 text-neon-green" strokeWidth={2} />
            ) : (
              <ShieldAlert className="h-4 w-4 text-neon-red" strokeWidth={2} />
            )}
          </div>
          <div>
            <div className="font-display text-sm font-bold text-slate-100">{attack.type}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-500">
              <Crosshair className="h-3 w-3" />
              <span className="tabular-nums">
                {attack.source} <span className="text-ink-600">→</span> {attack.target}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${sev.color} ${sev.ring}`}
          >
            {sev.label}
          </span>
          <span
            className={`text-[10px] font-semibold ${
              blocked ? 'text-neon-green' : 'text-neon-red neon-text-red'
            }`}
          >
            {blocked ? 'NEUTRALIZED' : 'ACTIVE'}
          </span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-ink-700/60 pt-2 text-[10px] text-ink-500">
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          <span className="tabular-nums">{timeAgo(attack.ts)}</span>
        </span>
        <span className="font-mono tracking-wider text-ink-600">
          SIG-{attack.id.toUpperCase().slice(0, 6)}
        </span>
      </div>
    </div>
  );
}
