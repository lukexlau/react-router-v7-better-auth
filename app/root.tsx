import {
	data,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { Toaster } from "sonner";

import type { Route } from "./+types/root";
import { GeneralErrorBoundary } from "./components/error-boundary";
import { ProgressBar } from "./components/progress-bar";
import { TooltipProvider } from "./components/ui/tooltip";
import { useNonce } from "./hooks/use-nonce";
import { useToast } from "./hooks/use-toast";
import {
	ClientHintCheck,
	getHints,
	useOptionalTheme,
} from "./lib/client-hints";
import { combineHeaders, getPageTitle } from "./lib/utils";
import {
	authMiddleware,
	logger,
	optionalAuthContext,
	trimTrailingSlash,
} from "./middlewares";
import { getClientEnv } from "./services/env.server";
import { getTheme } from "./services/theme.server";
import { getToast } from "./services/toast.server";
import stylesheet from "./styles/app.css?url";

export const middleware = [trimTrailingSlash, authMiddleware, logger];

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap",
	},
];

export const meta: Route.MetaFunction = ({ error }) => [
	{ title: getPageTitle(error ? "Oops! " : "") },
];

export async function loader({ request, context }: Route.LoaderArgs) {
	const clientEnv = getClientEnv();
	const authSession = context.get(optionalAuthContext);
	const { toast, headers: toastHeaders } = await getToast(request);

	return data(
		{
			user: authSession?.user ?? null,
			toast,
			requestInfo: {
				clientEnv,
				hints: getHints(request),
				userPrefs: { theme: getTheme(request) },
			},
		},
		{ headers: combineHeaders(toastHeaders) },
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const nonce = useNonce();
	const theme = useOptionalTheme();

	return (
		<html lang="en" className={`${theme}`}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
				<Meta />
				<Links />
				<link rel="stylesheet" href={stylesheet} precedence="high" />
				<ClientHintCheck nonce={nonce} />
			</head>
			<body>
				<TooltipProvider>
					<ProgressBar />
					{children}
				</TooltipProvider>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
				<Toaster position="top-center" theme={theme} />
			</body>
		</html>
	);
}

export default function App({ loaderData }: Route.ComponentProps) {
	const nonce = useNonce();
	useToast(loaderData.toast);

	// Form defaults + custom field props: `app/conform.ts` (`configureForms`)
	return (
		<>
			<Outlet />
			<script
				nonce={nonce}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: false positive
				dangerouslySetInnerHTML={{
					__html: `window.ENV = ${JSON.stringify(loaderData.requestInfo.clientEnv)}`,
				}}
			/>
		</>
	);
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
