import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cheese: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff8c1',
          300: '#fff3a2',
          400: '#ffef83',
          500: '#ffeb64',
          600: '#e6d45a',
          700: '#ccbd50',
          800: '#b3a646',
          900: '#998f3c',
        },
        orange: {
          cheese: '#ff8c42',
          'cheese-dark': '#e67d3a',
        },
        cream: {
          light: '#f5f5dc',
          medium: '#f0e68c',
        },
      },
    },
  },
  plugins: [],
}
export default config
