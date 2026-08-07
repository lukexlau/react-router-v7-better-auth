import {
	adminClient,
	customSessionClient,
	lastLoginMethodClient,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { cookiePrefix } from "~/lib/config";
import type { auth } from "./auth.server";
import { ac, admin, editor } from "./permissions";

export const authClient = createAuthClient({
	plugins: [
		usernameClient(),
		adminClient({
			ac,
			roles: {
				admin,
				editor,
			},
		}),
		lastLoginMethodClient({
			cookieName: `${cookiePrefix}.last_used_login_method`,
		}),
		customSessionClient<typeof auth>(),
	],
});

export type AuthClientSession = (typeof authClient.$Infer.Session)["session"];
export type AuthClientUser = (typeof authClient.$Infer.Session)["user"];
