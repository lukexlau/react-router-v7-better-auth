import { env } from "cloudflare:workers";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import {
	admin as adminPlugin,
	customSession as customSessionPlugin,
	lastLoginMethod as lastLoginMethodPlugin,
	username as usernamePlugin,
} from "better-auth/plugins";
import { appName, cookiePrefix } from "~/lib/config";
import { db } from "../db";
import { deleteUserImageFromR2 } from "../r2.server";
import { ac, admin, editor } from "./permissions";

const options = {
	appName,
	baseURL: env.VITE_BASE_URL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.VITE_BASE_URL, "http://localhost:4173"],

	telemetry: {
		enabled: false,
	},

	database: drizzleAdapter(db, {
		provider: "sqlite",
		usePlural: true,
	}),

	advanced: {
		cookiePrefix,
		ipAddress: {
			ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
		},
	},

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url, token }) => {
			if (import.meta.env.DEV) {
				console.log("Send email to reset password");
				console.log("User", user);
				console.log("URL", url);
				console.log("Token", token);
			} else {
				// Send email to user ...
			}
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }) => {
			if (import.meta.env.DEV) {
				console.log("Send email to verify email address");
				console.log(user, url, token);
			} else {
				// Send email to user ... (Use Resend or Cloudflare Send Email)
			}
		},
	},

	experimental: {
		joins: true,
	},

	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID || "",
			clientSecret: env.GITHUB_CLIENT_SECRET || "",
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID || "",
			clientSecret: env.GOOGLE_CLIENT_SECRET || "",
		},
	},

	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
			trustedProviders: ["google", "github"],
		},
	},

	user: {
		deleteUser: {
			enabled: true,
			afterDelete: async (user) => {
				if (user.image) {
					await deleteUserImageFromR2(user.image);
				}
			},
		},
	},

	secondaryStorage: {
		get: async (key) => await env.APP_KV.get(`auth:${key}`, "json"),
		set: async (key, value) =>
			await env.APP_KV.put(`auth:${key}`, JSON.stringify(value)),
		delete: async (key) => await env.APP_KV.delete(`auth:${key}`),
	},

	rateLimit: {
		enabled: true,
		storage: "secondary-storage",
		window: 60,
		max: 10,
	},

	plugins: [
		usernamePlugin({
			minUsernameLength: 3,
			maxUsernameLength: 32,
			displayUsernameValidator: (displayUsername) => {
				// Allow only alphanumeric characters, underscores, and hyphens
				return /^[a-zA-Z0-9_-]+$/.test(displayUsername);
			},
		}),
		adminPlugin({
			adminUserIds: [env.BETTER_AUTH_ADMIN_USER_ID],
			ac,
			roles: {
				admin,
				editor,
			},
		}),
		lastLoginMethodPlugin({
			cookieName: `${cookiePrefix}.last_used_login_method`,
		}),
	],

	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
} satisfies BetterAuthOptions;

export const auth = betterAuth({
	...options,

	plugins: [
		...(options.plugins ?? []),
		customSessionPlugin(async ({ user, session }) => {
			return {
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					displayUsername: user.displayUsername,
					image: user.image,
					email: user.email,
					role: user.role,
				},
				session: {
					userId: session.userId,
					token: session.token,
					ipAddress: session.ipAddress,
					userAgent: session.userAgent,
					expiresAt: session.expiresAt,
				},
			};
		}, options),
	],
});
