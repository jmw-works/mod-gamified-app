// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider as AmplifyProvider } from '@aws-amplify/ui-react';
import customTheme from './theme';
import './amplify';

// Global styles
import './styles/theme.css';
import '@aws-amplify/ui-react/styles.css'; // Amplify UI (Authenticator, etc.)
import './App.css';
import './theme.css';

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











