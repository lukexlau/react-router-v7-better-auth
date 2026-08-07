import { env } from "cloudflare:workers";
import type { Route } from "./+types/images";

export const loader = async ({ params }: Route.LoaderArgs) => {
	const key = params["*"];
	const object = await env.R2.get(key);
	if (!object) {
		return new Response(null, { status: 404 });
	}

	const blob = await object.blob();
	return new Response(blob.stream(), {
		headers: {
			"Content-Type":
				object.httpMetadata?.contentType ?? "application/octed-stream",
		},
	});
};
