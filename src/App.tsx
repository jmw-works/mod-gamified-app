// src/App.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import AuthenticatedShell from './pages/AuthenticatedShell';

export default function App() {
  return (
    <Authenticator>
      <AuthenticatedShell />
    </Authenticator>
  );
}

