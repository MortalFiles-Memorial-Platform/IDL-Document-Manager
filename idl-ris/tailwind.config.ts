import type { Config } from 'tailwindcss';

export default {
  content: ['./src/client/**/*.{ts,tsx}', './src/ui/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7fa',
          100: '#d8edf4',
          200: '#b3dce8',
          300: '#83c7da',
          400: '#4ba5c5',
          500: '#197ba0',
          600: '#135f7f',
          700: '#114d68',
          800: '#0f4156',
          900: '#0c3343'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
