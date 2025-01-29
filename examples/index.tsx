import { createRoot } from 'react-dom/client';
import App from './App';

const domNode = document.getElementById('root');
if (!domNode) throw new Error('Expected to find a DOM node with id "root"');

const root = createRoot(domNode);
root.render(<App />);
