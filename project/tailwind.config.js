/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#04060a',
          900: '#070b12',
          850: '#0a1018',
          800: '#0d141f',
          700: '#121b2a',
          600: '#1a2536',
          500: '#243349',
        },
        neon: {
          green: '#00ff9c',
          red: '#ff2d55',
          amber: '#ffb020',
          cyan: '#00e5ff',
          lime: '#aaff00',
        },
      },
      boxShadow: {
        'glow-green': '0 0 12px rgba(0,255,156,0.55), 0 0 32px rgba(0,255,156,0.25)',
        'glow-red': '0 0 12px rgba(255,45,85,0.6), 0 0 36px rgba(255,45,85,0.3)',
        'glow-amber': '0 0 12px rgba(255,176,32,0.55), 0 0 30px rgba(255,176,32,0.25)',
        'glow-cyan': '0 0 12px rgba(0,229,255,0.5), 0 0 30px rgba(0,229,255,0.2)',
        'inset-line': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.92' },
          '50%': { opacity: '0.7' },
          '55%': { opacity: '0.95' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        sweep: {
          '0%': { left: '-30%' },
          '100%': { left: '130%' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        flicker: 'flicker 4s infinite',
        scan: 'scan 6s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        blink: 'blink 1.1s step-end infinite',
        sweep: 'sweep 2.4s ease-in-out infinite',
        ticker: 'ticker 38s linear infinite',
      },
    },
  },
  plugins: [],
};
