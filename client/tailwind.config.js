import typographyPlugin from '@tailwindcss/typography';
import scrollbarPlugin from 'tailwind-scrollbar';

export default {
  content: ['./index.html', './src/**/*.tsx'],
  darkMode: 'selector',
  theme: {
    fontFamily: {
      roboto: ['"Roboto"', 'sans-serif'],
      slab: ['"Roboto Slab"', 'serif'],
      mono: ['"Roboto Mono"', 'monospace'],
      commissioner: ['"Commissioner"', 'sans-serif'],
    },
    colors: {
      slate: {
        50: '#FFFFFF',
        100: '#F5F5F5',
        150: '#E4E4E4',
        200: '#C1C4CB',
        250: '#7C8187',
        300: '#5A6069',
        350: '#35393F',
        400: '#2B2D31',
        450: '#1D1F22',
        500: '#151619',
        800: '#1e293b',
        950: '#020617',
      },
      orange: {
        500: '#F39765',
        600: '#E46643',
      },
      red: {
        500: '#ef4444',
      },
      green: {
        500: '#22c55e',
        600: '#16a34a',
      },
      transparent: 'transparent',
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-bullets': theme('colors.orange.600'),
            'ul > li::marker': {
              color: 'var(--tw-prose-bullets)',
            },
            'blockquote p:first-of-type::before': {
              content: 'none',
            },
            'blockquote p:last-of-type::after': {
              content: 'none',
            },
            'blockquote a': {
              fontWeight: '800',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-bullets': theme('colors.orange.600'),
          },
        },
      }),
    },
  },
  plugins: [
    typographyPlugin({
      className: 'preview',
    }),
    scrollbarPlugin({
      nocompatible: true,
      preferredStrategy: 'pseudoelements',
    }),
  ],
};
