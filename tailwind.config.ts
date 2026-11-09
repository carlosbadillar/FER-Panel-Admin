import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          active: '#1E293B',
        },
        fer: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#DBEAFE',
          green: '#10B981',
          'green-light': '#D1FAE5',
          orange: '#F59E0B',
          'orange-light': '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
