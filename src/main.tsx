// src/main.tsx
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Configure Amplify before any other Amplify modules are loaded.
Amplify.configure(outputs);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider as AmplifyProvider } from '@aws-amplify/ui-react';
import customTheme from './theme';

// Global styles
import './styles/theme.css';
import '@aws-amplify/ui-react/styles.css'; // Amplify UI (Authenticator, etc.)
import './App.css';
import './theme.css';

async function bootstrap() {
  const App = (await import('./App')).default;

  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error("Root element '#root' not found. Check your index.html.");
  }

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AmplifyProvider theme={customTheme}>
        <App />
      </AmplifyProvider>
    </React.StrictMode>,
  );
}

bootstrap();
