import type { Config } from 'tailwindcss';

export default {
  content: [
    './amd/src/**/*.{ts,tsx}',
    './templates/**/*.mustache',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
