/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          cream: '#f4f1e8',
          sage: '#dce8d2',
          moss: '#6c8a5b',
          forest: '#234233',
          deep: '#163126',
          clay: '#c8976b'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif']
      },
      boxShadow: {
        card: '0 18px 40px rgba(22, 49, 38, 0.12)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(220, 232, 210, 0.95), rgba(244, 241, 232, 0.7) 45%, rgba(200, 151, 107, 0.22))'
      }
    }
  },
  plugins: []
};
