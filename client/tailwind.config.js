/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          beige: '#E8DCC8',
          blue: '#0047AB',
          yellow: '#FFC93C',
          ivory: '#FBF7EE',
          ink: '#1A1A2E',
          'blue-hover': '#003580',
          'blue-light': '#E9F1FC',
          'yellow-hover': '#EDB323',
          'beige-dark': '#DECDB6',
          'ink-muted': '#4B4B60',
          'ink-subtle': '#86869E',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(26, 26, 46, 0.08), 0 2px 6px -1px rgba(26, 26, 46, 0.04)',
        'brand-hover': '0 12px 30px -4px rgba(26, 26, 46, 0.12), 0 4px 12px -2px rgba(26, 26, 46, 0.06)',
        'cobalt': '0 4px 14px 0 rgba(0, 71, 171, 0.35)',
        'sun': '0 4px 14px 0 rgba(255, 201, 60, 0.4)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
