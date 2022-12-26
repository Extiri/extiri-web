module.exports = {
	content: ['./src/routes/**/*.{svelte,js,ts}'],
	plugins: [require('daisyui')],
	daisyui: {
		styled: true,
		base: true,
		utils: true,
		logs: true,
		rtl: false,
		prefix: '',
		darkTheme: 'night',
		themes: ['night', 'night']
	}
};
