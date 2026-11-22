import { $ } from 'bun';

const declarationDir = '.temp/dts';
const relativeImportPattern = /from\s+['"]\.\.?\//;

async function build() {
	// Delete dist folder and the intermediate declaration emit
	await $`rm -rf dist ${declarationDir}`;

	// Generate bundle
	await Bun.build({
		entrypoints: ['./src/index.ts'],
		external: [
			// Uncomment these when https://github.com/atlassian/pragmatic-drag-and-drop/issues/27 is fixed
			// '@atlaskit/pragmatic-drag-and-drop',
			'react',
			'react-dom',
		],
		outdir: './dist',
	});

	// Emit per-file declarations, then roll them into one .d.ts with no
	// relative imports so node16/nodenext consumers can resolve the package.
	await $`tsc -p tsconfig.build.json`;
	await $`api-extractor run --local`;
	await $`rm -rf .temp`;

	const declarations = await Bun.file('./dist/index.d.ts').text();
	if (relativeImportPattern.test(declarations)) {
		throw new Error(
			'dist/index.d.ts still contains a relative import after declaration rollup',
		);
	}

	return console.debug('✅ DONE!');
}

await build();
