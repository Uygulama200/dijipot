import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          50: '#FFF0F0',
          100: '#FFE1E1',
          200: '#FFC4C4',
          300: '#FFA6A6',
          400: '#FF8989',
          500: '#FF6B6B',
          600: '#FF3D3D',
          700: '#FF0F0F',
          800: '#E00000',
          900: '#B20000',
        },
        secondary: {
          DEFAULT: '#2D3748',
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A202C',
          900: '#171923',
        },
      },
    },
  },
  plugins: [],
}
export default config
