import type { ThreatLevel } from '../types';

interface StatusPillProps {
  level: ThreatLevel;
}

const CONFIG: Record<
  ThreatLevel,
  { label: string; color: string; bg: string; border: string; dot: string; glow: string }
> = {
  safe: {
    label: 'SECURE',
    color: 'text-neon-green',
    bg: 'bg-neon-green/5',
    border: 'border-neon-green/40',
    dot: 'bg-neon-green',
    glow: 'shadow-glow-green',
  },
  elevated: {
    label: 'ELEVATED',
    color: 'text-neon-amber',
    bg: 'bg-neon-amber/5',
    border: 'border-neon-amber/40',
    dot: 'bg-neon-amber',
    glow: 'shadow-glow-amber',
  },
  critical: {
    label: 'CRITICAL',
    color: 'text-neon-red',
    bg: 'bg-neon-red/5',
    border: 'border-neon-red/50',
    dot: 'bg-neon-red',
    glow: 'shadow-glow-red',
  },
};

export default function StatusPill({ level }: StatusPillProps) {
  const c = CONFIG[level];
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 ${c.bg} ${c.border} ${c.glow}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-60 animate-pulse-ring`}
        />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.dot}`} />
      </span>
      <span className={`font-display text-xs font-bold tracking-[0.22em] ${c.color}`}>
        {c.label}
      </span>
    </div>
  );
}
