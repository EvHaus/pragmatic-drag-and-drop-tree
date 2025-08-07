// @ts-expect-error Something broke in the latest version. Hopefully can remove this once it's fixed.
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	root: 'examples',
});
