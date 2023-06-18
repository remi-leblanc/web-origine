/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
	content: ["./**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: colors.slate[700],
				secondary: colors.gray[100],
				dark: colors.slate[900],
			},
			backgroundImage: {
				'gradient-multi': "linear-gradient(to right, var(--tw-gradient-stops)), linear-gradient(to right, var(--tw-gradient-stops)), linear-gradient(to right, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
}
