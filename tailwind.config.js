/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        dsp: {
          blue: '#0D3B6A',
          red: '#E31837',
          white: '#FFFFFF',
          'light-blue': '#1E6AB2',
          'gray-light': '#F5F7FA',
          'gray-medium': '#8C9BAD',
          'gray-dark': '#2C3E50',
          success: '#28A745',
          warning: '#FFC107',
          danger: '#DC3545',
        },
        drogaria: {
          primary: '#0D3B6A',
          'primary-dark': '#1E6AB2',
          'primary-light': '#E6F2FC',
          secondary: '#28A745',
          'secondary-dark': '#1E7E34',
          'secondary-light': '#D4EDDA',
          accent: '#E31837',
          'accent-dark': '#C1121F',
          'accent-light': '#FFE5E5',
          warning: '#FFC107',
          danger: '#DC3545',
          light: '#F5F7FA',
          dark: '#2C3E50',
          gray: {
            light: '#F5F7FA',
            medium: '#8C9BAD',
            dark: '#2C3E50',
          },
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '8px',
        'button': '4px',
      },
      boxShadow: {
        'drogaria': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'drogaria-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

