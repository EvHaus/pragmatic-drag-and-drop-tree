import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const domNode = document.getElementById('root');
if (!domNode) throw new Error('Expected to find a DOM node with id "root"');

const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	// biome-ignore lint/suspicious/noAssignInExpressions: Bun recommends this
	const root = (import.meta.hot.data.root ??= createRoot(domNode));
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(domNode).render(app);
}
