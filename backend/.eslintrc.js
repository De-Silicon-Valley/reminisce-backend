module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
	overrides: [],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	rules: {
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["off"],
		"@typescript-eslint/no-unused-vars": "error",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/naming-convention": [
			"error",
			{
				selector: "variableLike",
				format: ["camelCase"],
				leadingUnderscore: "allow",
				trailingUnderscore: "allow",
				filter: {
					// you can expand this regex as you find more cases that
					regex: "/^[A-Z]+$/",
					match: true,
				},
			},
		],
	},
};
