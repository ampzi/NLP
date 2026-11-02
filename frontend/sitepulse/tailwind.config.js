/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#0b0f16',
        stone: '#2b3342',
        charcoal: '#98a2b3',
        ink: '#ece9e3',
        signal: '#eb5e28',
      },
      fontFamily: {
        sans: ['Peyda', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        subtle: '0 6px 20px rgba(0, 0, 0, 0.42)',
        glass: '0 10px 34px rgba(0, 0, 0, 0.38)',
      },
    },
  },
  plugins: [],
};
