import { Lock, Radio, ShieldOff, EyeOff } from 'lucide-react';
import type { PortEntry, PortStatus } from '../types';

interface PortTableProps {
  ports: PortEntry[];
}

const STATUS: Record<
  PortStatus,
  { label: string; color: string; icon: typeof Lock; dot: string }
> = {
  listening: { label: 'LISTEN', color: 'text-neon-cyan', icon: Radio, dot: 'bg-neon-cyan' },
  established: { label: 'ESTAB', color: 'text-neon-green', icon: Lock, dot: 'bg-neon-green' },
  blocked: { label: 'BLOCK', color: 'text-neon-red', icon: ShieldOff, dot: 'bg-neon-red' },
  stealth: { label: 'STEALTH', color: 'text-ink-500', icon: EyeOff, dot: 'bg-ink-500' },
};

function riskColor(r: number) {
  if (r >= 75) return 'bg-neon-red';
  if (r >= 40) return 'bg-neon-amber';
  return 'bg-neon-green';
}

export default function PortTable({ ports }: PortTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-ink-600/70 bg-ink-850/70 shadow-inset-line">
      <div className="grid grid-cols-[1fr_1fr_1.4fr_1fr_1.2fr] gap-2 border-b border-ink-700/70 bg-ink-900/50 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-500">
        <span>Port</span>
        <span>Proto</span>
        <span>Service</span>
        <span>Status</span>
        <span>Risk</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto thin-scroll">
        {ports.map((p) => {
          const s = STATUS[p.status];
          const Icon = s.icon;
          return (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_1fr_1.4fr_1fr_1.2fr] items-center gap-2 border-b border-ink-800/60 px-3 py-2 text-xs transition-colors hover:bg-ink-700/30"
            >
              <span className="font-mono font-bold tabular-nums text-slate-200">
                :{p.port}
              </span>
              <span className="font-mono text-ink-500">{p.protocol}</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Icon className={`h-3.5 w-3.5 ${s.color}`} strokeWidth={1.75} />
                {p.service}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <span className={`font-mono text-[10px] font-semibold ${s.color}`}>
                  {s.label}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700/70">
                  <div
                    className={`h-full rounded-full ${riskColor(p.risk)}`}
                    style={{ width: `${p.risk}%` }}
                  />
                </div>
                <span className="w-7 text-right font-mono text-[10px] tabular-nums text-ink-500">
                  {p.risk}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
