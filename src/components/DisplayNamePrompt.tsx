import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Card, Button, Heading, TextField } from '@aws-amplify/ui-react';
import { useUserProfile } from '../context/UserProfileContext';

const STORAGE_KEY = 'displayNameSet';

export default function DisplayNamePrompt() {
  const { profile, updateDisplayName, loading } = useUserProfile();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (profile?.displayName || localStorage.getItem(STORAGE_KEY)) {
      setCompleted(true);
    }
  }, [profile]);

  if (loading || completed) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 20) {
      setName(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9]{3,20}$/.test(name)) {
      setError('Name must be 3-20 alphanumeric characters.');
      return;
    }
    try {
      await updateDisplayName(name);
      localStorage.setItem(STORAGE_KEY, 'true');
      setCompleted(true);
    } catch {
      setError('Failed to save name.');
    }
  };

  return (
    <Card variation="elevated" marginBottom="large" padding="large">
      <Heading level={4} marginBottom="small">
        Choose a display name
      </Heading>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <TextField
          label="Display name"
          value={name}
          onChange={onChange}
          placeholder="Display name"
          maxLength={20}
        />
        <Button type="submit">Save</Button>
      </form>
      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
      )}
    </Card>
  );
}

