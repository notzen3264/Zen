/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        'crust': 'var(--theme-crust)',
        'base': 'var(--theme-base)',
        'surface0': 'var(--theme-surface0)',
        'text': 'var(--theme-text)',
        'subtext0': 'var(--theme-subtext0)',
        'blue': 'var(--theme-blue)',
      },
      opacity: {
        '5': '0.05',
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      screens: {
        xs: '480px'
      },
      width: {
        '420': '420px',
        '465': '465px'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addUtilities, theme }) {
      const colors = theme('colors');
      const opacities = theme('opacity');
      const utilities = {};
      
      Object.entries(colors).forEach(([color, value]) => {
        Object.entries(opacities).forEach(([opacity, opacityValue]) => {
          utilities[`.bg-${color}\\/${opacity}`] = {
            backgroundColor: `color-mix(in srgb, ${value} ${opacityValue * 100}%, transparent)`,
          };
        });
      });

      addUtilities(utilities);
    }
  ],
};