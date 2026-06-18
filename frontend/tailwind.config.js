/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dopamine Colors: warm light base, high-saturation curated clashes.
        cream: {
          DEFAULT: '#fff8f0',
          deep: '#fff1e2',
          panel: '#fffdf9',
          line: '#f0e2cf',
        },
        ink: {
          DEFAULT: '#2a1c2e',
          soft: '#6b5563',
          faint: '#9c8794',
        },
        magenta: {
          DEFAULT: '#ff5d8f',
          soft: '#ff86ab',
          deep: '#e23c70',
        },
        teal: {
          DEFAULT: '#2ad4c0',
          soft: '#74e6d8',
          deep: '#13a995',
        },
        sunflower: {
          DEFAULT: '#ffd23f',
          soft: '#ffe17a',
          deep: '#e8b51f',
        },
        muted: {
          DEFAULT: '#b8a6c4',
          soft: '#d4c8db',
        },
      },
      fontFamily: {
        display: ['"Darker Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Figtree"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        pop: '0 10px 0 -2px rgba(42, 28, 46, 0.12)',
        'pop-magenta': '0 12px 36px -10px rgba(255, 93, 143, 0.55)',
        'pop-teal': '0 12px 36px -10px rgba(42, 212, 192, 0.55)',
        'pop-sun': '0 12px 36px -10px rgba(255, 210, 63, 0.6)',
        block: '6px 6px 0 0 rgba(42, 28, 46, 0.9)',
        'block-sm': '4px 4px 0 0 rgba(42, 28, 46, 0.85)',
      },
      keyframes: {
        'burst-pop': {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'drift-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        tremble: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-1.5px, 1px) rotate(-0.6deg)' },
          '50%': { transform: 'translate(1.5px, -1px) rotate(0.6deg)' },
          '75%': { transform: 'translate(-1px, -1.5px) rotate(-0.4deg)' },
        },
        'bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'burst-pop': 'burst-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'drift-in': 'drift-in 0.5s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        tremble: 'tremble 0.4s ease-in-out infinite',
        bob: 'bob 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
