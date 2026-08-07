export const appName = "React Router x Better Auth";
export const appDescription =
	"This is a template that can be deployed on Cloudflare Workers, built with React Router v8 (Remix), Better Auth, Drizzle ORM, and D1.";

export const cookiePrefix = appName
	.toLowerCase()
	.replace(/[^a-z\s]/g, "")
	.replace(/\s+/g, "-");
