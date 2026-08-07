import { Suspense } from "react";
import { Await, useNavigate } from "react-router";
import { toast } from "sonner";

import { SignOutOfOtherSessions } from "~/components/settings/session-action";
import { SessionItem } from "~/components/settings/session-item";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { getPageTitle } from "~/lib/utils";
import { requiredAuthContext } from "~/middlewares/auth";
import { authClient } from "~/services/auth/auth.client";
import { auth } from "~/services/auth/auth.server";
import type { Route } from "./+types/sessions";

export function meta() {
	return [{ title: getPageTitle("Sessions") }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const { session } = context.get(requiredAuthContext);
	const listSessions = auth.api.listSessions({
		headers: request.headers,
	});

	return { listSessions, session };
}

export async function clientAction(_: Route.ClientActionArgs) {
	const { error } = await authClient.revokeOtherSessions();

	if (error) {
		toast.error(error.message || "An unexpected error occurred.");
		return { status: "error" };
	}

	toast.success("Other sessions signed out successfully.");
	return { status: "success" };
}

export default function SessionsRoute({ loaderData }: Route.ComponentProps) {
	const { session } = loaderData;
	const navigate = useNavigate();

	return (
		<SettingsLayout
			title="Sessions"
			description="If necessary, you can sign out of all other browser sessions. Some of your recent sessions are listed below, but this list may not be complete. If you think your account has been compromised, you should also update your password."
		>
			<div className="py-4">
				<Suspense
					fallback={
						<div className="divide-y rounded-lg border shadow-xs">
							<div className="flex flex-col gap-2 px-4 py-3">
								<Skeleton className="h-4 w-6/12" />
								<Skeleton className="h-4 w-8/12" />
							</div>
							<div className="flex flex-col gap-2 px-4 py-3">
								<Skeleton className="h-4 w-8/12" />
								<Skeleton className="h-4 w-10/12" />
							</div>
						</div>
					}
				>
					<Await
						resolve={loaderData.listSessions}
						errorElement={
							<div className="flex items-center justify-between rounded-lg border px-4 py-3 shadow-xs">
								<p>Error loading sessions.</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										navigate(".");
									}}
								>
									Refresh
								</Button>
							</div>
						}
					>
						{(resolvedSessions) => (
							<div className="space-y-4">
								<div className="divide-y rounded-lg border shadow-xs">
									{resolvedSessions.length === 0 ? (
										<div className="px-4 py-3">No sessions found.</div>
									) : (
										resolvedSessions.map((item) => (
											<SessionItem
												key={item.token}
												session={item}
												currentSessionToken={session.token}
											/>
										))
									)}
								</div>
								{resolvedSessions.length > 1 && <SignOutOfOtherSessions />}
							</div>
						)}
					</Await>
				</Suspense>
			</div>
		</SettingsLayout>
	);
}
