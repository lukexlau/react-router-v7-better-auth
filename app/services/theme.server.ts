import { parseCookie, stringifySetCookie } from "cookie";
import type { Theme } from "~/lib/client-hints";
import { cookiePrefix } from "~/lib/config";

const THEME_COOKIE_KEY = `${cookiePrefix}.theme`;

export function getTheme(request: Request): Theme | null {
	const cookieHeader = request.headers.get("Cookie");
	const parsed = cookieHeader
		? parseCookie(cookieHeader)[THEME_COOKIE_KEY]
		: "light";

	if (parsed === "light" || parsed === "dark") {
		return parsed;
	}

	return null;
}

export function setTheme(theme: Theme | "system") {
	if (theme === "system") {
		return stringifySetCookie({
			name: THEME_COOKIE_KEY,
			value: "",
			path: "/",
			maxAge: -1,
			sameSite: "lax",
		});
	}

	return stringifySetCookie({
		name: THEME_COOKIE_KEY,
		value: theme,
		path: "/",
		maxAge: 31536000, // 1 year
		sameSite: "lax",
	});
}
