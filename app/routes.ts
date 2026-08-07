import {
	index,
	layout,
	prefix,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		index("routes/index.tsx"),
		route("todos", "routes/todos.tsx"),

		// User settings routes
		...prefix("settings", [
			layout("routes/settings/layout.tsx", [
				route("account", "routes/settings/account.tsx"),
				route("appearance", "routes/settings/appearance.tsx"),
				route("sessions", "routes/settings/sessions.tsx"),
				route("password", "routes/settings/password.tsx"),
				route("connections", "routes/settings/connections.tsx"),
			]),
		]),
	]),

	// Better Auth routes
	...prefix("auth", [
		route("sign-in", "routes/auth/sign-in.tsx"),
		route("sign-up", "routes/auth/sign-up.tsx"),
		route("sign-out", "routes/auth/sign-out.tsx"),
		route("forget-password", "routes/auth/forget-password.tsx"),
		route("reset-password", "routes/auth/reset-password.tsx"),
	]),

	// Admin routes
	...prefix("admin", [
		layout("routes/admin/layout.tsx", [index("routes/admin/dashboard.tsx")]),
	]),

	// Image routes
	route("images/*", "routes/images.ts"),

	// Better Auth and other API routes
	...prefix("api", [
		route("auth/error", "routes/api/better-error.tsx"),
		route("auth/*", "routes/api/better.tsx"),
		route("theme-switcher", "routes/api/theme-switcher.ts"),
	]),

	// Not found
	route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
