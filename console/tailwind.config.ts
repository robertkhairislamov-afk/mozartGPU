import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'rich-carbon': '#111111',
        'neural-fog': '#f5f5f0',
        'gold': '#D4A843',
        'gold-dim': '#a8832e',
        'surface': '#161616',
        'surface-2': '#1e1e1e',
        'border': '#2a2a2a',
        'border-dim': '#222222',
        'muted': 'rgba(245,245,240,0.45)',
        'running': '#22c55e',
        'error': '#ef4444',
        'creating': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        input: '6px',
      },
      minHeight: {
        touch: '44px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.6)',
        'card-gold': '0 0 0 1px #D4A843',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
