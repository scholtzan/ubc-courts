/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,svelte,js,ts}'],
  theme: {
    extend: {},
  },
  daisyui: {
		themes: ['light'],
		styled: true,
		base: true
	},
  plugins: [require('daisyui')],
}

