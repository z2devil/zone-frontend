/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'logo-color': '#FFC445',
        primary: {
          50: '#0A59F7',
          100: '#317AF7',
        },
        danger: {
          50: '#F84026',
          100: '#D94838',
        },
        warning: {
          50: '#ED6F21',
          100: '#DB6B42',
        },
        success: {
          50: '#64BB5C',
          100: '#5BA854',
        },
        gray: {
          50: '#F3F1F2', // 页面背景
          100: '#F8F8F8', // 卡片背景1
          200: '#EFEFED', // 卡片背景2
          300: '#EBE9E9', // 边框
        },
        black: {
          50: 'rgba(0, 0, 0, 0.05)',
          80: 'rgba(0, 0, 0, 0.08)',
          100: 'rgba(0, 0, 0, 0.1)',
          200: 'rgba(0, 0, 0, 0.2)',
          250: 'rgba(0, 0, 0, 0.25)',
          300: 'rgba(0, 0, 0, 0.3)',
          400: 'rgba(0, 0, 0, 0.4)',
          500: 'rgba(0, 0, 0, 0.5)',
          600: 'rgba(0, 0, 0, 0.6)',
          700: 'rgba(0, 0, 0, 0.7)',
          800: 'rgba(0, 0, 0, 0.8)',
          900: 'rgba(0, 0, 0, 0.9)',
        },
      },
      fontSize: {
        15: '0.9375rem',
        17: '1.0625rem',
        19: '1.1875rem',
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      boxShadow: {
        main: '0px 6px 18px 0px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        flash: 'highlight 1s',
      },
      keyframes: ({ theme }) => ({
        highlight: {
          '0%': {
            color: theme('colors.danger.100'),
          },
          '100%': {},
        },
      }),
    },
  },
  plugins: [],
};
