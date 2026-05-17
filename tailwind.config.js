/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flo: '#AAFF00',
        tan: '#C8A96E',
        tac: {
          950: '#060606',
          900: '#0C0C08',
          800: '#131310',
          750: '#181814',
          700: '#1E1E18',
          650: '#24241C',
          600: '#2C2C22',
          500: '#38382C',
          400: '#484838',
          300: '#606050',
          200: '#808068',
          100: '#A8A890',
          50:  '#D0D0B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hex-dots': `
          radial-gradient(circle, rgba(170,255,0,0.07) 1px, transparent 1px),
          radial-gradient(circle, rgba(170,255,0,0.04) 1px, transparent 1px)
        `,
        'hex-dots-tan': `
          radial-gradient(circle, rgba(200,169,110,0.08) 1px, transparent 1px),
          radial-gradient(circle, rgba(200,169,110,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'hex': '28px 48px',
      },
      boxShadow: {
        'flo':    '0 0 20px rgba(170,255,0,0.08)',
        'flo-sm': '0 0 10px rgba(170,255,0,0.06)',
        'tan':    '0 0 20px rgba(200,169,110,0.08)',
      },
    },
  },
  plugins: [],
}
