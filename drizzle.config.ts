// import { existsSync, readdirSync } from "node:fs";

import type { Config } from "drizzle-kit";

/* 
const D1_DIR = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";

const getD1Url = (): string => {
	if (!existsSync(D1_DIR)) return "";

	const sqliteFile = readdirSync(D1_DIR).find((f) => f.endsWith(".sqlite"));
	return sqliteFile ? `${D1_DIR}/${sqliteFile}` : "";
};

export const d1Url = getD1Url(); 

// Change to using: http://localhost:5173/cdn-cgi/explorer
*/

export default {
	schema: "./app/services/db/schema",
	out: "./drizzle/migrations",
	dialect: "sqlite",
	// dbCredentials: {
	// 	url: d1Url,
	// },
} satisfies Config;
