import { $ } from 'bun';

const relativeImportPattern = /from\s+['"]\.\.?\//;

async function build() {
	// Delete dist folder
	await $`rm -rf dist`;

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

	// Bundle declarations into one dist/index.d.ts so node16/nodenext
	// consumers never have to resolve a relative import.
	await $`tsdown`;

	const declarations = await Bun.file('./dist/index.d.ts').text();
	if (relativeImportPattern.test(declarations)) {
		throw new Error(
			'dist/index.d.ts still contains a relative import after declaration rollup',
		);
	}

	return console.debug('✅ DONE!');
}

await build();
