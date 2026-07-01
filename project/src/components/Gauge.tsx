import { useEffect, useState } from 'react';

interface GaugeProps {
  value: number; // 0-100
  label: string;
  sublabel?: string;
  variant: 'green' | 'red' | 'amber' | 'cyan';
  size?: number;
}

const VARIANT_COLOR: Record<GaugeProps['variant'], string> = {
  green: '#00ff9c',
  red: '#ff2d55',
  amber: '#ffb020',
  cyan: '#00e5ff',
};

const VARIANT_GLOW: Record<GaugeProps['variant'], string> = {
  green: '0 0 10px rgba(0,255,156,0.7), 0 0 26px rgba(0,255,156,0.35)',
  red: '0 0 10px rgba(255,45,85,0.75), 0 0 28px rgba(255,45,85,0.4)',
  amber: '0 0 10px rgba(255,176,32,0.7), 0 0 26px rgba(255,176,32,0.35)',
  cyan: '0 0 10px rgba(0,229,255,0.7), 0 0 26px rgba(0,229,255,0.35)',
};

export default function Gauge({ value, label, sublabel, variant, size = 168 }: GaugeProps) {
  const [display, setDisplay] = useState(value);

  // Smoothly animate the needle/value toward the target.
  useEffect(() => {
    let raf = 0;
    const start = display;
    const delta = value - start;
    const t0 = performance.now();
    const dur = 650;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const stroke = 10;
  const r = (size - stroke) / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  // 270deg arc, from 135deg to 405deg
  const startAngle = 135;
  const sweep = 270;
  const clamped = Math.max(0, Math.min(100, display));
  const valueAngle = startAngle + (clamped / 100) * sweep;

  const polar = (angle: number, radius: number) => {
    const a = (angle * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  };

  const arcPath = (from: number, to: number, radius: number) => {
    const [x1, y1] = polar(from, radius);
    const [x2, y2] = polar(to, radius);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const color = VARIANT_COLOR[variant];
  const glow = VARIANT_GLOW[variant];
  const [nx, ny] = polar(valueAngle, r - 14);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          {/* track */}
          <path
            d={arcPath(startAngle, startAngle + sweep, r)}
            fill="none"
            stroke="rgba(120,160,200,0.12)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* value arc */}
          <path
            d={arcPath(startAngle, valueAngle, r)}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(${glow})` }}
          />
          {/* tick marks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const a = startAngle + (i / 10) * sweep;
            const [x1, y1] = polar(a, r + 8);
            const [x2, y2] = polar(a, r + 13);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(120,160,200,0.35)"
                strokeWidth={1}
              />
            );
          })}
          {/* needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(${glow})` }}
          />
          <circle cx={cx} cy={cy} r={5} fill={color} style={{ filter: `drop-shadow(${glow})` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-3xl font-extrabold tabular-nums"
            style={{ color, textShadow: `0 0 10px ${color}99` }}
          >
            {Math.round(display)}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-500 mt-0.5">%</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          {label}
        </div>
        {sublabel && <div className="text-[10px] text-ink-500 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
