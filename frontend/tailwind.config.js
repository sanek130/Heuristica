export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#1a1a1a',
        border: '#2a2a2a',
        text: { primary: '#ffffff', secondary: '#e5e5e5', muted: '#a3a3a3' },
        accent: { blue: '#2563eb', purple: '#7c3aed', gold: '#f59e0b' },
        error: '#ef4444',
        warning: '#f59e0b'
      },
      animation: {
        'sphere-grow': 'sphereGrow 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out'
      },
      keyframes: {
        sphereGrow: {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
