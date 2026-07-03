import { $ } from 'bun';

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

	// Generate types
	await $`tsc -p tsconfig.build.json`;

	return console.debug('✅ DONE!');
}

await build();
