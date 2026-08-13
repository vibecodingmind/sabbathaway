import { Pool } from 'pg';
import {
  initialProfiles,
  initialListings,
  initialChurches,
  initialStayRequests,
  initialMessages,
  initialReviews,
  initialVerificationRequests,
  initialAuditLogs,
  initialFamilyProfiles,
  initialFamilyExchangeRequests,
  initialFamilyExchangeReviews,
  initialMemberships,
  initialTransactions,
  initialStayCategories
} from '../src/data/mockData';
import { PLAN_PRICING } from '../src/lib/membershipEngine';
import { hashPassword } from './auth';

/**
 * Collections stored as JSONB documents. The frontend consumes these exact shapes,
 * so persisting them as documents keeps the API and the client model in lockstep.
 */
export const COLLECTIONS = [
  'listings',
  'churches',
  'stayRequests',
  'messages',
  'reviews',
  'verifications',
  'auditLogs',
  'familyProfiles',
  'familyExchangeRequests',
  'familyExchangeReviews',
  'memberships',
  'transactions',
  'safetyReports',
  'stayCategories'
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

const TABLE_FOR: Record<CollectionName, string> = {
  listings: 'col_listings',
  churches: 'col_churches',
  stayRequests: 'col_stay_requests',
  messages: 'col_messages',
  reviews: 'col_reviews',
  verifications: 'col_verifications',
  auditLogs: 'col_audit_logs',
  familyProfiles: 'col_family_profiles',
  familyExchangeRequests: 'col_family_exchange_requests',
  familyExchangeReviews: 'col_family_exchange_reviews',
  memberships: 'col_memberships',
  transactions: 'col_transactions',
  safetyReports: 'col_safety_reports',
  stayCategories: 'col_stay_categories'
};

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  data: any; // UserProfile
}

export interface Store {
  init(): Promise<void>;
  listCollection(name: CollectionName): Promise<any[]>;
  getDoc(name: CollectionName, id: string): Promise<any | null>;
  upsertDoc(name: CollectionName, doc: any): Promise<any>;
  deleteDoc(name: CollectionName, id: string): Promise<void>;
  // Users / credentials
  getUserByEmail(email: string): Promise<StoredUser | null>;
  getUserById(id: string): Promise<StoredUser | null>;
  createUser(u: StoredUser): Promise<void>;
  updateUserData(id: string, data: any): Promise<void>;
  listUsers(): Promise<any[]>;
  // Favorites
  getFavorites(userId: string): Promise<string[]>;
  setFavorite(userId: string, listingId: string, on: boolean): Promise<void>;
  // Settings (e.g. plan pricing)
  getSetting<T = any>(key: string): Promise<T | null>;
  setSetting(key: string, value: any): Promise<void>;
}

const SEED_MAP: Record<CollectionName, any[]> = {
  listings: initialListings,
  churches: initialChurches,
  stayRequests: initialStayRequests,
  messages: initialMessages,
  reviews: initialReviews,
  verifications: initialVerificationRequests,
  auditLogs: initialAuditLogs,
  familyProfiles: initialFamilyProfiles,
  familyExchangeRequests: initialFamilyExchangeRequests,
  familyExchangeReviews: initialFamilyExchangeReviews,
  memberships: initialMemberships,
  transactions: initialTransactions,
  safetyReports: [],
  stayCategories: initialStayCategories
};

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'sabbath2026';

/** Postgres-backed store using JSONB document tables. */
class PgStore implements Store {
  constructor(private pool: Pool) {}

  async init(): Promise<void> {
    for (const name of COLLECTIONS) {
      const table = TABLE_FOR[name];
      await this.pool.query(
        `CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`
      );
    }
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
    );
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL,
        listing_id TEXT NOT NULL,
        PRIMARY KEY (user_id, listing_id)
      )`
    );
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL
      )`
    );
    await this.seedIfEmpty();
  }

  private async seedIfEmpty(): Promise<void> {
    const { rows } = await this.pool.query('SELECT COUNT(*)::int AS c FROM app_users');
    if (rows[0].c > 0) return;
    console.log('[db] Seeding initial data...');

    for (const name of COLLECTIONS) {
      for (const doc of SEED_MAP[name]) {
        await this.upsertDoc(name, doc);
      }
    }

    for (const profile of initialProfiles) {
      const email = (profile.email || '').toLowerCase();
      if (!email) continue;
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      await this.createUser({ id: profile.id, email, passwordHash, data: profile });
    }

    await this.setSetting('planPricing', PLAN_PRICING);
    console.log('[db] Seed complete.');
  }

  async listCollection(name: CollectionName): Promise<any[]> {
    const { rows } = await this.pool.query(`SELECT data FROM ${TABLE_FOR[name]}`);
    return rows.map((r) => r.data);
  }

  async getDoc(name: CollectionName, id: string): Promise<any | null> {
    const { rows } = await this.pool.query(`SELECT data FROM ${TABLE_FOR[name]} WHERE id = $1`, [id]);
    return rows[0]?.data ?? null;
  }

  async upsertDoc(name: CollectionName, doc: any): Promise<any> {
    if (!doc || !doc.id) throw new Error('Document requires an id');
    await this.pool.query(
      `INSERT INTO ${TABLE_FOR[name]} (id, data, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [doc.id, JSON.stringify(doc)]
    );
    return doc;
  }

  async deleteDoc(name: CollectionName, id: string): Promise<void> {
    await this.pool.query(`DELETE FROM ${TABLE_FOR[name]} WHERE id = $1`, [id]);
  }

  async getUserByEmail(email: string): Promise<StoredUser | null> {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, data FROM app_users WHERE lower(email) = lower($1)',
      [email]
    );
    if (!rows[0]) return null;
    return { id: rows[0].id, email: rows[0].email, passwordHash: rows[0].password_hash, data: rows[0].data };
  }

  async getUserById(id: string): Promise<StoredUser | null> {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, data FROM app_users WHERE id = $1',
      [id]
    );
    if (!rows[0]) return null;
    return { id: rows[0].id, email: rows[0].email, passwordHash: rows[0].password_hash, data: rows[0].data };
  }

  async createUser(u: StoredUser): Promise<void> {
    await this.pool.query(
      `INSERT INTO app_users (id, email, password_hash, data) VALUES ($1, $2, $3, $4)`,
      [u.id, u.email.toLowerCase(), u.passwordHash, JSON.stringify(u.data)]
    );
  }

  async updateUserData(id: string, data: any): Promise<void> {
    await this.pool.query('UPDATE app_users SET data = $2 WHERE id = $1', [id, JSON.stringify(data)]);
  }

  async listUsers(): Promise<any[]> {
    const { rows } = await this.pool.query('SELECT data FROM app_users ORDER BY created_at ASC');
    return rows.map((r) => r.data);
  }

  async getFavorites(userId: string): Promise<string[]> {
    const { rows } = await this.pool.query('SELECT listing_id FROM favorites WHERE user_id = $1', [userId]);
    return rows.map((r) => r.listing_id);
  }

  async setFavorite(userId: string, listingId: string, on: boolean): Promise<void> {
    if (on) {
      await this.pool.query(
        `INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, listingId]
      );
    } else {
      await this.pool.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [userId, listingId]);
    }
  }

  async getSetting<T = any>(key: string): Promise<T | null> {
    const { rows } = await this.pool.query('SELECT data FROM settings WHERE key = $1', [key]);
    return (rows[0]?.data as T) ?? null;
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.pool.query(
      `INSERT INTO settings (key, data) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data`,
      [key, JSON.stringify(value)]
    );
  }
}

/** In-memory fallback used when DATABASE_URL is not configured (local/dev only). */
class MemoryStore implements Store {
  private cols: Record<string, Map<string, any>> = {};
  private users = new Map<string, StoredUser>();
  private favorites = new Map<string, Set<string>>();
  private settings = new Map<string, any>();

  async init(): Promise<void> {
    for (const name of COLLECTIONS) {
      this.cols[name] = new Map();
      for (const doc of SEED_MAP[name]) this.cols[name].set(doc.id, doc);
    }
    for (const profile of initialProfiles) {
      const email = (profile.email || '').toLowerCase();
      if (!email) continue;
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      this.users.set(profile.id, { id: profile.id, email, passwordHash, data: profile });
    }
    this.settings.set('planPricing', PLAN_PRICING);
    console.warn('[db] DATABASE_URL not set — using in-memory store (data will NOT persist across restarts).');
  }

  async listCollection(name: CollectionName): Promise<any[]> {
    return Array.from(this.cols[name]?.values() ?? []);
  }
  async getDoc(name: CollectionName, id: string): Promise<any | null> {
    return this.cols[name]?.get(id) ?? null;
  }
  async upsertDoc(name: CollectionName, doc: any): Promise<any> {
    if (!doc || !doc.id) throw new Error('Document requires an id');
    this.cols[name].set(doc.id, doc);
    return doc;
  }
  async deleteDoc(name: CollectionName, id: string): Promise<void> {
    this.cols[name]?.delete(id);
  }
  async getUserByEmail(email: string): Promise<StoredUser | null> {
    for (const u of this.users.values()) if (u.email.toLowerCase() === email.toLowerCase()) return u;
    return null;
  }
  async getUserById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) ?? null;
  }
  async createUser(u: StoredUser): Promise<void> {
    this.users.set(u.id, { ...u, email: u.email.toLowerCase() });
  }
  async updateUserData(id: string, data: any): Promise<void> {
    const u = this.users.get(id);
    if (u) u.data = data;
  }
  async listUsers(): Promise<any[]> {
    return Array.from(this.users.values()).map((u) => u.data);
  }
  async getFavorites(userId: string): Promise<string[]> {
    return Array.from(this.favorites.get(userId) ?? []);
  }
  async setFavorite(userId: string, listingId: string, on: boolean): Promise<void> {
    if (!this.favorites.has(userId)) this.favorites.set(userId, new Set());
    const set = this.favorites.get(userId)!;
    if (on) set.add(listingId);
    else set.delete(listingId);
  }
  async getSetting<T = any>(key: string): Promise<T | null> {
    return (this.settings.get(key) as T) ?? null;
  }
  async setSetting(key: string, value: any): Promise<void> {
    this.settings.set(key, value);
  }
}

let storePromise: Promise<Store> | null = null;

export function getStore(): Promise<Store> {
  if (storePromise) return storePromise;
  storePromise = (async () => {
    const url = process.env.DATABASE_URL;
    let store: Store;
    if (url) {
      const pool = new Pool({
        connectionString: url,
        ssl: /sslmode=require/.test(url) || process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
      });
      store = new PgStore(pool);
    } else {
      store = new MemoryStore();
    }
    await store.init();
    return store;
  })();
  return storePromise;
}
