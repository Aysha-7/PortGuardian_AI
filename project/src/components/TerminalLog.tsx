import { useEffect, useRef } from 'react';
import type { LogLine } from '../types';

interface TerminalLogProps {
  lines: LogLine[];
  title?: string;
}

const LEVEL_STYLE: Record<LogLine['level'], { color: string; tag: string }> = {
  INFO: { color: 'text-neon-cyan', tag: 'INFO ' },
  WARN: { color: 'text-neon-amber', tag: 'WARN ' },
  ALERT: { color: 'text-neon-red', tag: 'ALERT' },
  OK: { color: 'text-neon-green', tag: ' OK  ' },
  DEBUG: { color: 'text-ink-500', tag: 'DBUG ' },
};

function ts(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${String(
    d.getMilliseconds(),
  ).padStart(3, '0')}`;
}

export default function TerminalLog({ lines, title = 'AI.CORE // STREAM' }: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-ink-600/70 bg-ink-950/80 shadow-inset-line">
      <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-red/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon-green/70" />
          </div>
          <span className="ml-1 font-display text-[11px] font-bold tracking-[0.2em] text-slate-300">
            {title}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-neon-green">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
          LIVE
        </span>
      </div>
      <div
        ref={scrollRef}
        className="thin-scroll relative flex-1 overflow-y-auto px-3 py-2.5 font-mono text-[11.5px] leading-relaxed"
      >
        {/* moving scanline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-neon-green/5 to-transparent animate-scan" />
        {lines.map((l) => {
          const s = LEVEL_STYLE[l.level];
          return (
            <div key={l.id} className="flex gap-2 whitespace-pre-wrap break-words">
              <span className="shrink-0 text-ink-600 tabular-nums">{ts(l.ts)}</span>
              <span className={`shrink-0 font-bold ${s.color}`}>[{s.tag}]</span>
              <span className="shrink-0 text-ink-600">{l.tag.padEnd(9)}</span>
              <span className={l.level === 'ALERT' ? 'text-neon-red neon-text-red' : 'text-slate-300'}>
                {l.text}
              </span>
            </div>
          );
        })}
        <div className="flex gap-2">
          <span className="text-neon-green neon-text-green">guardian@ai-core</span>
          <span className="text-ink-600">:~$</span>
          <span className="inline-block h-3.5 w-2 bg-neon-green animate-blink" />
        </div>
      </div>
    </div>
  );
}
