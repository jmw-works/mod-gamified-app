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
  const [loginTriggered, setLoginTriggered] = useState(false);

  if (authStatus === 'authenticated') {
    return <AuthenticatedShell />;
  }

  if (!loginTriggered) {
    return <PublicShell onRequireAuth={() => setLoginTriggered(true)} />;
  }

  return (
    <Authenticator>
      <AuthenticatedShell />
    </Authenticator>
  );
}

