// eslint-disable-next-line no-undef
module.exports = {
	settings: {
		react: {
			version: 'detect',
		},
	},
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/jsx-runtime',
	],
	overrides: [],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			modules: true,
		},
	},
	plugins: ['react', '@typescript-eslint', 'simple-import-sort'],
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		'no-multi-spaces': 'error',
		'no-trailing-spaces': 'error',
		'no-var': 'error',
		'no-useless-return': 'error',
		'no-useless-escape': 'error',
		'no-useless-concat': 'error',
		'no-return-await': 'error',
		'no-multi-assign': 'error',
		'no-lonely-if': 'error',
		'no-labels': 'error',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'warn',
		'no-use-before-define': 'warn',
		'object-curly-spacing': ['error', 'always'],
		'object-shorthand': ['error', 'always'],
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
	},
}
