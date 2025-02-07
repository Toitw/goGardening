
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from '@neondatabase/serverless';
import { log } from "./vite";
import * as schema from "@shared/schema";

const sql = neon(process.env.DATABASE_URL || '');
export const db = drizzle(sql, { schema });

process.on('SIGINT', () => {
  log('Closing database connection');
  process.exit();
});

process.on('SIGTERM', () => {
  log('Closing database connection');
  process.exit();
});
