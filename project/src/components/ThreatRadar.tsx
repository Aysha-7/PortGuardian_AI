import { useEffect, useState } from 'react';

interface Blip {
  id: number;
  angle: number; // deg
  dist: number; // 0-1 of radius
  color: string;
  label: string;
}

const INITIAL_BLIPS: Blip[] = [
  { id: 1, angle: 32, dist: 0.6, color: '#ff2d55', label: 'DMA-7' },
  { id: 2, angle: 110, dist: 0.4, color: '#ffb020', label: 'FW-3' },
  { id: 3, angle: 200, dist: 0.75, color: '#ff2d55', label: 'JTAG' },
  { id: 4, angle: 300, dist: 0.5, color: '#00e5ff', label: 'SCAN' },
];

export default function ThreatRadar() {
  const [sweep, setSweep] = useState(0);
  const [blips, setBlips] = useState(INITIAL_BLIPS);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = (now - t0) / 4000;
      setSweep((p % 1) * 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Occasionally shuffle blip positions to feel alive
  useEffect(() => {
    const id = setInterval(() => {
      setBlips((prev) =>
        prev.map((b) => ({
          ...b,
          angle: (b.angle + (Math.random() - 0.5) * 40 + 360) % 360,
          dist: Math.max(0.2, Math.min(0.9, b.dist + (Math.random() - 0.5) * 0.2)),
        })),
      );
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const size = 220;
  const c = size / 2;
  const r = size / 2 - 14;
  const sweepRad = (sweep * Math.PI) / 180;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          {/* rings */}
          {[0.33, 0.66, 1].map((f, i) => (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r * f}
              fill="none"
              stroke="rgba(0,229,255,0.18)"
              strokeWidth={1}
            />
          ))}
          {/* cross lines */}
          <line x1={c} y1={c - r} x2={c} y2={c + r} stroke="rgba(0,229,255,0.15)" strokeWidth={1} />
          <line x1={c - r} y1={c} x2={c + r} y2={c} stroke="rgba(0,229,255,0.15)" strokeWidth={1} />
          {/* sweep wedge */}
          <defs>
            <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,229,255,0.35)" />
              <stop offset="100%" stopColor="rgba(0,229,255,0)" />
            </radialGradient>
          </defs>
          <path
            d={`M ${c} ${c} L ${c + r * Math.cos(sweepRad - 0.5)} ${c + r * Math.sin(sweepRad - 0.5)} A ${r} ${r} 0 0 1 ${c + r * Math.cos(sweepRad)} ${c + r * Math.sin(sweepRad)} Z`}
            fill="url(#sweepGrad)"
          />
          <line
            x1={c}
            y1={c}
            x2={c + r * Math.cos(sweepRad)}
            y2={c + r * Math.sin(sweepRad)}
            stroke="rgba(0,229,255,0.7)"
            strokeWidth={1.5}
          />
          {/* blips */}
          {blips.map((b) => {
            const a = (b.angle * Math.PI) / 180;
            const bx = c + r * b.dist * Math.cos(a);
            const by = c + r * b.dist * Math.sin(a);
            return (
              <g key={b.id}>
                <circle cx={bx} cy={by} r={3.5} fill={b.color}>
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={bx} cy={by} r={7} fill="none" stroke={b.color} strokeWidth={1} opacity={0.4} />
                <text x={bx + 8} y={by + 3} fontSize={8} fill={b.color} fontFamily="JetBrains Mono">
                  {b.label}
                </text>
              </g>
            );
          })}
          {/* center */}
          <circle cx={c} cy={c} r={4} fill="#00ff9c" />
          <circle cx={c} cy={c} r={8} fill="none" stroke="#00ff9c" strokeWidth={1} opacity={0.4} />
        </svg>
      </div>
      <div className="mt-1 text-center text-[10px] uppercase tracking-[0.2em] text-ink-500">
        Perimeter Radar // {blips.length} contacts
      </div>
    </div>
  );
}
