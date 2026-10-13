import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from '@/App';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = window.Buffer || Buffer;
window.process = window.process || process;

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');

createRoot(root).render(
  <StrictMode>
    <HelmetProvider>
      <PostHogProvider>
        <App />
      </PostHogProvider>
    </HelmetProvider>
  </StrictMode>,
);
