/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
	content: ["./**/*.{ts,tsx}"],
	plugins: [require("daisyui")],
	theme: {
		colors: {
			"primary-lighter": "#A6B2FF",
			"primary-darker": "#677AF4",
		},
		extend: {
			fontFamily: {
				display: 'Inter',
			}
		}
	},
	daisyui: {
		themes: [
			{
				light: {
					...require("daisyui/src/theming/themes")["[data-theme=light]"],
					"primary": "#003399",
					"error": "#EB4747",
					"base-100": "#FFFFFF",
					"base-200": "#EDF2F6",
					"neutral": "#494953",
					"success": "#34B065",
					"warning": "#FF9B50",
				},
			},
		]
	}
}
