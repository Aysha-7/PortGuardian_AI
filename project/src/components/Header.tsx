import { Cpu, Activity, Power } from 'lucide-react';
import StatusPill from './StatusPill';
import type { ThreatLevel } from '../types';

interface HeaderProps {
  level: ThreatLevel;
  uptime: string;
  aiStatus: string;
}

export default function Header({ level, uptime, aiStatus }: HeaderProps) {
  return (
    <header className="relative z-10 flex flex-col gap-4 border-b border-ink-700/70 bg-ink-900/50 px-5 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neon-green/40 bg-neon-green/5 shadow-glow-green">
          <Cpu className="h-6 w-6 text-neon-green" strokeWidth={1.75} />
          <span className="absolute -inset-px rounded-md border border-neon-green/20 animate-flicker" />
        </div>
        <div>
          <h1 className="font-display text-lg font-extrabold tracking-[0.18em] text-slate-100">
            PORT<span className="text-neon-green neon-text-green">GUARDIAN</span>
            <span className="ml-1.5 text-xs font-medium tracking-[0.3em] text-ink-500">AI</span>
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-ink-500">
            Hardware Threat Intelligence Console
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-ink-600/70 bg-ink-850/70 px-3 py-1.5">
          <Activity className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="text-[10px] uppercase tracking-widest text-ink-500">UPTIME</span>
          <span className="font-mono text-xs tabular-nums text-slate-200">{uptime}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-ink-600/70 bg-ink-850/70 px-3 py-1.5">
          <Power className="h-3.5 w-3.5 text-neon-green" />
          <span className="text-[10px] uppercase tracking-widest text-ink-500">AI.CORE</span>
          <span className="font-mono text-xs text-neon-green">{aiStatus}</span>
        </div>
        <StatusPill level={level} />
      </div>
    </header>
  );
}
