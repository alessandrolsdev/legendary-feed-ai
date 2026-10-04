/** @type {import('tailwindcss').Config} */

// Tokens do design system. Antes o `extend` estava vazio e todas as cores
// eram escolhidas caso a caso (gray-900 aqui, gray-950 ali), o que deixava a
// interface sem um vocabulário comum.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superfícies, do fundo da página para cima.
        ink: {
          DEFAULT: '#07080d',
          soft: '#0b0e16',
          raised: '#11151f',
          high: '#171c29',
        },
        // Cor de identidade de cada tier, usada no card e no capítulo de scroll.
        tier: {
          common: '#94a3b8',
          rare: '#38bdf8',
          epic: '#a855f7',
          legendary: '#f5a524',
        },
        brand: {
          violet: '#8b5cf6',
          pink: '#ec4899',
          ember: '#f97316',
        },
      },
      borderColor: {
        line: 'rgb(255 255 255 / 0.08)',
        'line-strong': 'rgb(255 255 255 / 0.16)',
      },
      fontFamily: {
        // Display expressivo para as chamadas; texto neutro para leitura;
        // mono do sistema para rótulos técnicos, sem custo de rede.
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Escala de display fluida: acompanha a viewport sem media query.
        'display-sm': ['clamp(2.5rem, 9vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(3.25rem, 12vw, 7rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        // 13vw cabe "LEGENDARY" (9 caracteres) em 390px mesmo quando a fonte
        // display não carrega e o fallback, mais largo, entra no lugar.
        'display-lg': ['clamp(2.75rem, 13vw, 11rem)', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        content: '72rem',
      },
      boxShadow: {
        card: '0 24px 60px -24px rgb(0 0 0 / 0.9)',
        glow: '0 0 60px -12px var(--tw-shadow-color)',
      },
      transitionTimingFunction: {
        // Desaceleração longa: a curva padrão das revelações por scroll.
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -18px, 0)' },
        },
        'scroll-hint': {
          '0%': { transform: 'translate3d(0, 0, 0)', opacity: '0' },
          '35%': { opacity: '1' },
          '100%': { transform: 'translate3d(0, 14px, 0)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translate3d(100%, 0, 0)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'scroll-hint': 'scroll-hint 1.8s ease-out infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
