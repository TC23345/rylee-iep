import "server-only";

import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

// HMR-safe MongoClient singleton (rebuild-spec §3). The driver is kept out of the
// bundle via serverExternalPackages:['mongodb'] in next.config.ts.
interface MongoCache {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
}

const globalForMongo = global as unknown as { _mongo?: MongoCache };
const cached: MongoCache = (globalForMongo._mongo ??= {});

// Some Windows machines cannot enumerate their DNS servers from Node, which breaks
// the SRV lookup behind mongodb+srv:// URIs. MONGODB_DNS_SERVERS (comma-separated)
// pins the resolver explicitly. Unset in production, so this is a no-op there.
let dnsConfigured = false;
function configureDns(): void {
  if (dnsConfigured) return;
  dnsConfigured = true;
  const servers = (process.env.MONGODB_DNS_SERVERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
    dns.promises.setServers(servers);
  }
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI or MONGO_URI");
  return uri;
}

async function getClient(): Promise<MongoClient> {
  if (cached.client) return cached.client;
  if (!cached.promise) {
    configureDns();
    const uri = getMongoUri();
    cached.promise = new MongoClient(uri, { maxPoolSize: 10 }).connect();
  }
  cached.client = await cached.promise;
  return cached.client;
}

export async function getDb(name = process.env.MONGODB_DB ?? "rylee_iep"): Promise<Db> {
  const client = await getClient();
  return client.db(name);
}
