import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: false,
	dts: {
		dtsOnly: true,
	},
	entry: {
		index: 'src/index.ts',
	},
	fixedExtension: false,
	format: 'esm',
	outDir: 'dist',
	sourcemap: false,
});
