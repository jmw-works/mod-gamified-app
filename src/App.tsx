// src/App.tsx
import { useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import AuthenticatedShell from './pages/AuthenticatedShell';
import PublicShell from './pages/PublicShell';

export default function App() {
  return (
    <Authenticator.Provider>
      <AppContent />
    </Authenticator.Provider>
  );
}

function AppContent() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const [showAuth, setShowAuth] = useState(false);

  if (authStatus === 'authenticated') {
    return <AuthenticatedShell />;
  }

  if (showAuth) {
    return <Authenticator />;
  }

  return <PublicShell onRequireAuth={() => setShowAuth(true)} />;
}

