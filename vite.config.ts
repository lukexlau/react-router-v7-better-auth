import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
		}),
		tailwindcss(),
		reactRouter(),
		devtoolsJson(),
	],
	// Resolve tsconfig `paths` (~/*) for dev/SSR; unrelated to optimizeDeps
	resolve: { tsconfigPaths: true },
	server: {
		open: true,
	},
	build: {
		minify: true,
	},
});
