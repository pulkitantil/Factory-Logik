/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        voltrix: {
          dark: '#111111',
          charcoal: '#1A1A1A',
          green: '#0B3D2E',
          'green-light': '#145A44',
          orange: '#FF5A1F',
          'orange-hover': '#E04812',
          bg: '#F7F7F5',
          card: '#FFFFFF',
          border: '#E5E7EB',
          muted: '#6B7280',
          success: '#16A34A',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 24px -6px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        elevation: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'pulse-fast': 'pulseFast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
