import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        fill: 'rgb(var(--color-fill) / <alpha-value>)',
        text: 'rgb(var(--color-text-base) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
      },
      fontFamily: {
        body: ['Newsreader', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        page: '48rem',
        prose: '65ch',
      },
    },
  },
  plugins: [typography],
};
