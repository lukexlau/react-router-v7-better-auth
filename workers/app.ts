import { createRequestHandler } from "react-router";

import { trimTrailingSlash } from "./http";

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request) {
		const redirectResponse = trimTrailingSlash(request);

		if (redirectResponse) {
			return redirectResponse;
		}

		return requestHandler(request);
	},
} satisfies ExportedHandler<Env>;
