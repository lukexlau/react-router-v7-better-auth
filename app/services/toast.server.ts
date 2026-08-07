import { env } from "cloudflare:workers";
import { createCookieSessionStorage, data, redirect } from "react-router";
import { z } from "zod/v4";
import { cookiePrefix } from "~/lib/config";
import { combineHeaders } from "~/lib/utils";

const toastKey = "flash-toast";

const toastSchema = z.object({
	id: z.string().default(() => crypto.randomUUID()),
	title: z.string(),
	description: z.string().optional(),
	type: z
		.enum(["message", "success", "error", "warning", "info"])
		.default("message"),
});

export type Toast = z.infer<typeof toastSchema>;
export type ToastInput = z.input<typeof toastSchema>;

const toastSessionStorage = createCookieSessionStorage({
	cookie: {
		name: `${cookiePrefix}.toast`,
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secrets: env.SESSION_SECRET.split(","),
		secure: import.meta.env.PROD,
	},
});

async function createToastHeaders(toastInput: ToastInput) {
	const session = await toastSessionStorage.getSession();
	const toast = toastSchema.parse(toastInput);
	session.flash(toastKey, toast);
	const cookie = await toastSessionStorage.commitSession(session);
	return new Headers({ "set-cookie": cookie });
}

async function createToastHeadersAndCombine(
	toastInput: ToastInput,
	existingHeaders?: ResponseInit["headers"],
) {
	return combineHeaders(existingHeaders, await createToastHeaders(toastInput));
}

/**
 * Gets the toast from the session
 * @param request The request
 * @returns The toast and headers
 */
export async function getToast(request: Request) {
	const session = await toastSessionStorage.getSession(
		request.headers.get("cookie"),
	);
	const result = toastSchema.safeParse(session.get(toastKey));
	const toast = result.success ? result.data : null;
	// Always commit session to clear flash data (flash is automatically cleared on commit)
	const headers = new Headers({
		"set-cookie": await toastSessionStorage.commitSession(session),
	});
	return {
		toast,
		headers,
	};
}

/**
 * Redirects to a new URL with toast headers combined with existing headers
 * @param url The URL to redirect to
 * @param toast Toast message to flash
 * @param init Optional existing headers to combine with
 * @returns Redirect response with combined headers
 */
export async function redirectWithToast(
	url: string,
	toast: ToastInput,
	init?: ResponseInit,
) {
	return redirect(url, {
		...init,
		headers: await createToastHeadersAndCombine(toast, init?.headers),
	});
}

/**
 * Returns data with toast headers combined with existing headers
 * @param dataToReturn The data to return
 * @param toast Toast message to flash
 * @param init Optional existing headers to combine with
 * @returns Data response with combined headers
 */
export async function dataWithToast<T = null>(
	dataToReturn: T,
	toast: ToastInput,
	init?: ResponseInit,
) {
	return data(dataToReturn, {
		...init,
		headers: await createToastHeadersAndCombine(toast, init?.headers),
	});
}
