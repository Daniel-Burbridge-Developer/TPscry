import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseURL = process.env.DATABASE_URL!;

if (!databaseURL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(databaseURL);

export const db = drizzle(sql, { schema });
