module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2d2d2d',
          600: '#404040',
        },
        premium: {
          orange: '#ff5500',
          'orange-dark': '#cc4400',
          gold: '#ffd700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
       animation: {
         'fade-in': 'fadeIn 1s ease-in-out',
         'slide-up': 'slideUp 0.8s ease-out',
         'float': 'float 6s ease-in-out infinite',
         'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
         'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
         'scale-in': 'scaleIn 0.5s ease-out forwards',
         'switch-press': 'switchPress 0.2s ease-out',
       },
       keyframes: {
         fadeIn: {
           '0%': { opacity: '0' },
           '100%': { opacity: '1' },
         },
         slideUp: {
           '0%': { opacity: '0', transform: 'translateY(20px)' },
           '100%': { opacity: '1', transform: 'translateY(0)' },
         },
         float: {
           '0%, 100%': { transform: 'translateY(0)' },
           '50%': { transform: 'translateY(-20px)' },
         },
         fadeInUp: {
           '0%': { opacity: '0', transform: 'translateY(30px)' },
           '100%': { opacity: '1', transform: 'translateY(0)' },
         },
         scaleIn: {
           '0%': { opacity: '0', transform: 'scale(0.8)' },
           '100%': { opacity: '1', transform: 'scale(1)' },
         },
         switchPress: {
           '0%': { transform: 'scale(1)' },
           '50%': { transform: 'scale(0.9)' },
           '100%': { transform: 'scale(1)' },
         },
       },
    },
  },
  plugins: [],
}
