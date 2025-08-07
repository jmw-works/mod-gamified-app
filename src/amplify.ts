import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

declare global {
  interface Window {
    __AMPLIFY_CONFIGURED__?: boolean;
  }
}

const g = globalThis as unknown as { __AMPLIFY_CONFIGURED__?: boolean };
if (!g.__AMPLIFY_CONFIGURED__) {
  Amplify.configure(outputs);
  g.__AMPLIFY_CONFIGURED__ = true;
}

export {};
