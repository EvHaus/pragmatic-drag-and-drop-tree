import { serve } from 'bun';
import index from './index.html';

const server = serve({
	development: process.env.NODE_ENV !== 'production',
	routes: {
		'/*': index,
	},
});

// biome-ignore lint/suspicious/noConsole: Useful here
console.log(`🚀 Server running at ${server.url}`);
