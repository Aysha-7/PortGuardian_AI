import { Radio } from 'lucide-react';

interface ThreatTickerProps {
  items: string[];
}

export default function ThreatTicker({ items }: ThreatTickerProps) {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex items-center gap-3 overflow-hidden border-y border-ink-700/70 bg-ink-900/40 py-2">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-ink-950 px-3 py-1">
        <Radio className="h-3.5 w-3.5 text-neon-red animate-pulse" />
        <span className="font-display text-[10px] font-bold tracking-[0.22em] text-neon-red neon-text-red">
          THREAT FEED
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker gap-8 whitespace-nowrap font-mono text-[11px] text-ink-500">
          {doubled.map((it, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-neon-red">◆</span>
              {it}
            </span>
          ))}
        </div>
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-ink-950 to-transparent" />
      </div>
    </div>
  );
}
