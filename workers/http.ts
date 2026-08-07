/**
 * Redirect safe navigation requests to their canonical URL without
 * trailing slashes.
 *
 * Examples:
 * - `/about/` → `/about`
 * - `/about///?tab=profile` → `/about?tab=profile`
 *
 * The root path `/` and non-GET/HEAD requests are not redirected.
 */
export function trimTrailingSlash(request: Request): Response | undefined {
	if (request.method !== "GET" && request.method !== "HEAD") {
		return;
	}

	const url = new URL(request.url);

	if (url.pathname === "/" || !url.pathname.endsWith("/")) {
		return;
	}

	url.pathname = url.pathname.replace(/\/+$/, "");

	return Response.redirect(url.toString(), 308);
}
