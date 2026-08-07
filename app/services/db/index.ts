import { env as cloudflareEnv } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const db = drizzle(cloudflareEnv.DB, {
	schema,
	logger: import.meta.env.DEV,
});
