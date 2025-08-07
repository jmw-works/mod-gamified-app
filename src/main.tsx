// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; // Amplify Gen 2 outputs (project root)
import App from './App';
import { ThemeProvider as AmplifyProvider } from '@aws-amplify/ui-react';
import customTheme from './theme';

// Global styles
import './styles/theme.css';
import '@aws-amplify/ui-react/styles.css'; // Amplify UI (Authenticator, etc.)
import './App.css';
import './theme.css';

/**
 * Configure Amplify *once* before any Amplify UI components/hooks mount.
 * Calling configure multiple times is generally okay, but during Vite HMR this
 * guard avoids noisy reconfiguration warnings or timing issues.
 */
 (function configureAmplifyOnce() {
   const g: { __AMPLIFY_CONFIGURED__?: boolean } = globalThis as unknown as {
     __AMPLIFY_CONFIGURED__?: boolean;
   };
   if (!g.__AMPLIFY_CONFIGURED__) {
     Amplify.configure(outputs);
     g.__AMPLIFY_CONFIGURED__ = true;
   }
 })();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error("Root element '#root' not found. Check your index.html.");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AmplifyProvider theme={customTheme}>
      <App />
    </AmplifyProvider>
  </React.StrictMode>
);











