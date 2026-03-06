import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  }

  // Usar Pool para conexiones más eficientes
  const sql = neon(databaseUrl, {
    fetchOptions: {
      cache: "no-store",
    },
  });

  return drizzle(sql, {
    schema,
    logger: process.env.NODE_ENV === "development",
  });
}

type Database = ReturnType<typeof createDb>;

let dbInstance: Database | null = null;

function getDbInstance(): Database {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

// Proxy para evitar evaluar la conexión en import-time durante build.
export const db: Database = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const instance = getDbInstance();
    const value = Reflect.get(instance as object, property, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type DB = Database;

// Cache simple en memoria para datos estáticos (expira en 5 minutos)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
