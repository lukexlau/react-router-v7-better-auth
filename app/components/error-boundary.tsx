import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import {
	isRouteErrorResponse,
	Link,
	useNavigate,
	useRouteError,
} from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/components/ui/empty";
import { cn } from "~/lib/utils";

function getErrorMessage(error: unknown): string {
	if (typeof error === "string") return error;

	return error &&
		typeof error === "object" &&
		"message" in error &&
		typeof error.message === "string"
		? error.message
		: "Unknown Error";
}

function DevErrorPage({
	title,
	description,
	stack,
}: {
	title: string;
	description: string;
	stack?: string;
}) {
	return (
		<main className="container mx-auto space-y-2 p-4 sm:p-8">
			<div>
				<h1 className="font-semibold text-xl">{title}</h1>
				<p className="wrap-break-word max-h-96 overflow-y-auto text-base text-muted-foreground">
					{description}
				</p>
			</div>
			{stack && (
				<div className="rounded-lg bg-red-600/10 p-4 text-red-600">
					<pre className="max-h-96 w-full overflow-x-auto overflow-y-auto text-sm">
						{stack}
					</pre>
				</div>
			)}
			<small className="font-light font-mono text-muted-foreground/80">
				Application Error only visible in development environment.
			</small>
		</main>
	);
}

export function ErrorPage({
	title,
	description,
	className,
}: {
	title: string;
	description: string;
	className?: string;
}) {
	const navigate = useNavigate();

	return (
		<main
			className={cn(
				"flex min-h-screen flex-col items-center justify-center gap-y-4 p-6",
				className,
			)}
		>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<AlertCircleIcon />
					</EmptyMedia>
					<EmptyTitle className="font-semibold text-xl">{title}</EmptyTitle>
					<EmptyDescription>{description}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex gap-2">
						<Link to="/" className={buttonVariants()}>
							Go to Home
						</Link>
					</div>
				</EmptyContent>
				<Button
					variant="link"
					className="cursor-pointer text-muted-foreground text-xs"
					size="sm"
					onClick={() => navigate(-1)}
				>
					<ArrowLeftIcon className="size-3" />
					Go Back
				</Button>
			</Empty>
		</main>
	);
}

export function GeneralErrorBoundary({ className }: { className?: string }) {
	const error = useRouteError();
	const isDev = import.meta.env.DEV;

	let title = "Oops! Something went wrong.";
	let description =
		"An unexpected error occurred.\nYou may also refresh the page or try again later.";
	let stack: string | undefined;

	// Handle RouteErrorResponse (throw new Response)
	if (isRouteErrorResponse(error)) {
		switch (error.status) {
			case 400:
				title = "400 Bad Request";
				description =
					"The request could not be understood by the server due to malformed syntax.";
				break;
			case 401:
				title = "401 Unauthorized";
				description = "You are not authorized to access this page.";
				break;
			case 403:
				title = "403 Forbidden";
				description = "You are not allowed to access this page.";
				break;
			case 404:
				title = "404 Not Found";
				description = "The page you are looking for does not exist.";
				break;
			case 405:
				title = "405 Method Not Allowed";
				description = "The method you are using is not allowed.";
				break;
			case 503:
				title = "503 Service Unavailable";
				description = "The service is currently unavailable.";
				break;
		}

		// Use the custom message from throw new Response
		if (error.data) {
			const customMessage = getErrorMessage(error.data);
			if (customMessage !== "Unknown Error") {
				description = customMessage;
			}
		}
	} else if (error instanceof Error) {
		// Handle normal JavaScript Error
		title = isDev ? "Application Error" : title;
		description = isDev ? error.message : description;
		stack = isDev ? error.stack : undefined;
	}

	// If it's a development environment and there's a stack trace, show the development error page
	if (isDev && stack && error && error instanceof Error) {
		return (
			<DevErrorPage title={title} description={description} stack={stack} />
		);
	}

	return (
		<ErrorPage title={title} description={description} className={className} />
	);
}
