/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          sky: '#99CDD8',
          mint: '#DAEBE3',
          peach: '#FDE8D3',
          rose: '#F3C3B2',
          sage: '#CFD6C4',
          forest: '#657166',
        },
        brand: {
          50: '#f4f6f4',
          100: '#e3e8e4',
          200: '#CFD6C4',
          300: '#b4c0b5',
          400: '#89998b',
          500: '#657166', // Deep Eucalyptus Slate from Palette
          600: '#515c52',
          700: '#414a42',
          800: '#343c35',
          900: '#252b26',
          950: '#181c18',
        },
        cream: {
          50: '#fffdfa',
          100: '#FDE8D3', // Warm Peach Cream from Palette
          200: '#f9dec5',
          300: '#f2cdab',
          400: '#DAEBE3', // Soft Mint from Palette
          500: '#b5d5c5',
        },
        terracotta: {
          50: '#fdf8f6',
          100: '#faeee9',
          200: '#F3C3B2', // Dusty Rose Blush from Palette
          300: '#e7a895',
          400: '#d98a75',
          500: '#c56b56',
          600: '#b05440',
          700: '#92402e',
          800: '#753123',
          900: '#5a2419',
        },
        sage: {
          100: '#f4f6f2',
          200: '#e4e8de',
          300: '#CFD6C4', // Earthy Sage from Palette
          400: '#b1beA4',
          500: '#92a284',
          600: '#758467',
        },
        sky: {
          100: '#ebf5f7',
          200: '#cce3e8',
          300: '#99CDD8', // Sky Blue from Palette
          400: '#75b3c1',
          500: '#5397a6',
        },
        mint: {
          100: '#f3f9f6',
          200: '#DAEBE3', // Soft Mint from Palette
          300: '#b9d7c8',
          400: '#93bda8',
          500: '#6ea088',
        },
        charcoal: {
          50: '#f6f7f6',
          100: '#e7e8e7',
          200: '#cfd1cf',
          300: '#aeb2af',
          400: '#868b87',
          500: '#657166',
          600: '#515c52',
          700: '#414a42',
          800: '#2c322d',
          900: '#1d211e',
          950: '#121513',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(43, 41, 39, 0.05)',
        'float': '0 10px 30px -5px rgba(43, 41, 39, 0.1)',
        'inner-light': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
