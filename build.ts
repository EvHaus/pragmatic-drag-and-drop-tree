import { rm } from 'node:fs/promises';

async function build() {
	// Delete dist folder
	await rm('./dist', { force: true, recursive: true });

	// Generate bundle
	await Bun.build({
		entrypoints: ['./src/index.ts'],
		external: [
			'@atlaskit/pragmatic-drag-and-drop',
			'@atlaskit/pragmatic-drag-and-drop-flourish',
			'react',
			'react-dom',
		],
		outdir: './dist',
	});

	// Hack for https://github.com/atlassian/pragmatic-drag-and-drop/issues/27
	const content = (await Bun.file('dist/index.js').text())
		.replaceAll(
			'@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash',
			'@atlaskit/pragmatic-drag-and-drop-flourish/dist/esm/trigger-post-move-flash.js',
		)
		.replaceAll(
			'@atlaskit/pragmatic-drag-and-drop/combine',
			'@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/combine.js',
		)
		.replaceAll(
			'@atlaskit/pragmatic-drag-and-drop/element/adapter',
			'@atlaskit/pragmatic-drag-and-drop/dist/esm/adapter/element-adapter.js',
		)
		.replaceAll(
			'@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview',
			'@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/pointer-outside-of-preview.js',
		)
		.replaceAll(
			'@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview',
			'@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/set-custom-native-drag-preview.js',
		);

	await Bun.write('dist/index.js', content);

	// Generate types
	const { stdout, stderr } = await Bun.spawn([
		'tsc',
		'-p',
		'tsconfig.build.json',
	]);
	const stdoutStr = await new Response(stdout).text();
	const stderrStr = await new Response(stderr).text();
	if (stderrStr) return console.error(stderrStr);

	return console.debug(`✅ DONE! ${stdoutStr}`);
}

build();
