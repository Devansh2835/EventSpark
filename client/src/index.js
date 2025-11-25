import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Cleanup any content injected by browser extensions (e.g., stray text nodes or
// <script> tags inserted before our app mounts). Some extensions inject scripts
// that write text directly into the document which can appear before React mounts.
const cleanupInjectedContent = () => {
    try {
        // Remove extension script tags
        document.querySelectorAll('script[src^="chrome-extension://"]').forEach(el => el.remove());

        // Remove known injected element id used by some extensions
        const injected = document.getElementById('injectedScript');
        if (injected) injected.remove();

        // Remove stray text nodes in body (keep #root and noscript)
        Array.from(document.body.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
                node.textContent = '';
            }
        });
    } catch (err) {
        // don't block app startup on cleanup error
        // eslint-disable-next-line no-console
        console.warn('cleanupInjectedContent error:', err);
    }
};

cleanupInjectedContent();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);