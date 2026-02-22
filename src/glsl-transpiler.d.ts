declare module 'glsl-transpiler' {
	interface TranspilerOptions {
		// Enable expressions optimizations.
		optimize?: boolean

		// Apply preprocessing. Pass custom preprocessor function `(srcString) => resultString;` to set own preprocessing.
		preprocess?: boolean

		// GLSL shader version, one of `'300 es'` or `'100 es'`.
		version?: string

		// Append stdlib includes for the result. Can be bool or an object with defined stdlib functions to include, eg. `{normalize: false, min: false}`.
		includes?: boolean

		// Enable debugging facilities: `print(anything)` will log to console a string of transpiled code with it’s type separated by colon, `show(anything)` will print the rendered descriptor of passed fragment of code. Note also that you can safely use `console.log(value)` to debug shader runtime.
		debug?: boolean

		uniform?: (name: string) => string
		attribute?: (name: string) => string
		varying?: (name: string) => string
	}

	function GLSL(options?: TranspilerOptions): compile
	function compile(source: string): string

	export default GLSL
}
