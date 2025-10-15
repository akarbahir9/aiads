const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'background': '#111317',
        'surface': '#1B1D21',
        'primary': '#4F46E5',
        'primary-hover': '#4338CA',
        'secondary': '#374151',
        'secondary-hover': '#4B5563',
        'accent': '#A78BFA',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'border-color': '#374151',
      },
      backgroundImage: {
        'gradient-button': 'linear-gradient(to right, #4F46E5, #A78BFA)',
        'gradient-button-hover': 'linear-gradient(to right, #4338CA, #8B5CF6)',
      },
      keyframes: {
        grid: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        grid: 'grid 15s linear infinite',
      },
    },
  },
  plugins: [],
};
