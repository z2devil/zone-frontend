/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // https://vercel.com/design/color
      colors: {
        'logo-color': '#FFC445',
        'theme-color': '#0A59F7',
        'border-color': '#EBE9E9',
        'background-color': {
          50: '#F3F1F2',
          100: '#F9F9F9',
          200: '#EFEFED',
        },
        black: {
          50: 'rgba(0, 0, 0, 0.05)',
          100: 'rgba(0, 0, 0, 0.1)',
          200: 'rgba(0, 0, 0, 0.2)',
          300: 'rgba(0, 0, 0, 0.3)',
          400: 'rgba(0, 0, 0, 0.4)',
          500: 'rgba(0, 0, 0, 0.5)',
          600: 'rgba(0, 0, 0, 0.6)',
          700: 'rgba(0, 0, 0, 0.7)',
          800: 'rgba(0, 0, 0, 0.8)',
          900: 'rgba(0, 0, 0, 0.9)',
        },
      },
      keyframes: ({ theme }) => ({
        rerender: {
          '0%': {
            'border-color': theme('colors.vercel.pink'),
          },
          '40%': {
            'border-color': theme('colors.vercel.pink'),
          },
        },
        highlight: {
          '0%': {
            background: theme('colors.vercel.pink'),
            color: theme('colors.white'),
          },
          '40%': {
            background: theme('colors.vercel.pink'),
            color: theme('colors.white'),
          },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        translateXReset: {
          '100%': {
            transform: 'translateX(0)',
          },
        },
        fadeToTransparent: {
          '0%': {
            opacity: 1,
          },
          '40%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
      }),
    },
  },
  plugins: [],
};
