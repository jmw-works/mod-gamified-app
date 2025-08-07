import '../amplify';
import { generateClient } from 'aws-amplify/data';
import type { Client } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

export const client: Client<Schema> = generateClient<Schema>();
