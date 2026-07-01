import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: string;
  accent?: 'green' | 'red' | 'amber' | 'cyan';
}

const ACCENT: Record<NonNullable<StatCardProps['accent']>, string> = {
  green: 'text-neon-green',
  red: 'text-neon-red',
  amber: 'text-neon-amber',
  cyan: 'text-neon-cyan',
};

export default function StatCard({ icon: Icon, label, value, delta, accent = 'cyan' }: StatCardProps) {
  return (
    <div className="bracket-corners relative overflow-hidden rounded-md border border-ink-600/70 bg-ink-850/70 px-4 py-3 shadow-inset-line backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-500">{label}</div>
          <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${ACCENT[accent]}`}>
            {value}
          </div>
        </div>
        <Icon className={`h-5 w-5 ${ACCENT[accent]} opacity-80`} strokeWidth={1.75} />
      </div>
      {delta && (
        <div className="mt-1 text-[10px] text-ink-500 tabular-nums">{delta}</div>
      )}
    </div>
  );
}
