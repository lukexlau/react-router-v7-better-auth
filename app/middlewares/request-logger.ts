import type { MiddlewareFunction } from "react-router";

enum LogPrefix {
	Incoming = "-->",
	Outgoing = "<--",
	Error = "xxx",
}

const RESET = "\x1b[0m";

function color(value: string | number, code: number): string {
	return `\x1b[${code}m${value}${RESET}`;
}

function colorMethod(method: string): string {
	const normalized = method.toUpperCase();

	switch (normalized) {
		case "GET":
			return color(normalized, 32);
		case "POST":
			return color(normalized, 36);
		case "PUT":
		case "PATCH":
			return color(normalized, 33);
		case "DELETE":
			return color(normalized, 31);
		default:
			return color(normalized, 35);
	}
}

function colorStatus(status: number): string {
	if (status >= 500) return color(status, 31);
	if (status >= 400) return color(status, 33);
	if (status >= 300) return color(status, 36);
	if (status >= 200) return color(status, 32);

	return color(status, 35);
}

function formatDuration(start: number): string {
	const duration = performance.now() - start;

	return duration < 1000
		? `${Math.round(duration)}ms`
		: `${(duration / 1000).toFixed(2)}s`;
}

function logIncoming(method: string, path: string): void {
	console.log(`  ${LogPrefix.Incoming} ${colorMethod(method)} ${path}`);
}

function logOutgoing(
	method: string,
	path: string,
	status: number,
	duration: string,
): void {
	console.log(
		`  ${LogPrefix.Outgoing} ${colorMethod(method)} ${path} ${colorStatus(status)} ${duration}`,
	);
}

function logError(
	method: string,
	path: string,
	duration: string,
	error: unknown,
): void {
	console.error(
		`  ${LogPrefix.Error} ${colorMethod(method)} ${path} ${duration}`,
		error,
	);
}

export const requestLogger: MiddlewareFunction = async (
	{ request, url },
	next,
) => {
	if (import.meta.env.PROD) {
		return next();
	}

	const { method } = request;
	const path = `${url.pathname}${url.search}`;
	const start = performance.now();

	logIncoming(method, path);

	try {
		const response = (await next()) as Response;

		logOutgoing(method, path, response.status, formatDuration(start));

		return response;
	} catch (error) {
		const duration = formatDuration(start);

		if (error instanceof Response) {
			logOutgoing(method, path, error.status, duration);
		} else {
			logError(method, path, duration, error);
		}

		throw error;
	}
};
