/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'primary-blue': '#103992',
				'secondary-blue': '#225FAD',
				'secondary-gray': '#D9D9D9'
			},
			fontFamily: {
				sans: ['Open Sans', 'sans-serif']
			}
		}
	},
	plugins: []
};
