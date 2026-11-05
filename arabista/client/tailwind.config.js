/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Strict 5-tone palette & semantic variants
      forest: {
        DEFAULT: '#173D32',
        dark: '#112C24',
        light: '#1E4E40',
      },
      ivory: {
        DEFAULT: '#F6F1E7',
        dark: '#ECE3D2',
        light: '#FAF7F1',
      },
      sage: {
        DEFAULT: '#A5AF96',
        dark: '#8C977B',
        light: '#C1C8B6',
      },
      coffee: {
        DEFAULT: '#B78B59',
        dark: '#9E7444',
        light: '#CCA77A',
      },
      charcoal: {
        DEFAULT: '#242321',
        dark: '#171615',
        light: '#383633',
      },
      'forest-green': '#173D32',
      'warm-ivory': '#F6F1E7',
      'coffee-tan': '#B78B59',
    },
    fontFamily: {
      serif: ['"Playfair Display"', 'Georgia', 'serif'],
      sans: ['"DM Sans"', '"Poppins"', 'sans-serif'],
      display: ['"Playfair Display"', 'Georgia', 'serif'],
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      full: '9999px',
      pill: '9999px',
      arch: '160px 160px 0 0',
      'arch-full': '9999px 9999px 0 0',
    },
    boxShadow: {
      none: 'none',
      sm: '0 2px 8px -2px rgba(36, 35, 33, 0.05)',
      DEFAULT: '0 8px 24px -4px rgba(36, 35, 33, 0.08)',
      md: '0 12px 32px -6px rgba(36, 35, 33, 0.10)',
      lg: '0 16px 40px -8px rgba(23, 61, 50, 0.12)',
      soft: '0 10px 30px -10px rgba(36, 35, 33, 0.08)',
      'soft-hover': '0 16px 36px -10px rgba(23, 61, 50, 0.16)',
      'inner-soft': 'inset 0 2px 4px 0 rgba(36, 35, 33, 0.06)',
    },
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
    },
  },
  plugins: [],
};
