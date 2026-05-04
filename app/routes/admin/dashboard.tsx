import { count } from "drizzle-orm";
import { FileStackIcon, FoldersIcon, TagsIcon, UsersIcon } from "lucide-react";
import { Suspense } from "react";
import { Await, data, href } from "react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { users } from "~/drizzle/schema";
import { useAuthUser } from "~/hooks/use-auth-user";
import { getPageTitle } from "~/lib/utils";
import { db } from "~/services/db.server";
import { isProduction } from "~/services/env.server";
import type { Route } from "./+types/dashboard";

export function meta() {
	return [{ title: getPageTitle("Dashboard") }];
}

export const handle = {
	breadcrumb: () => ({ label: "Dashboard", to: href("/admin") }),
};

export async function loader(_: Route.LoaderArgs) {
	const usersCountPromise = db
		.select({ count: count(users.id) })
		.from(users)
		.get()
		.then((result) => result?.count ?? 0);

	// TODO: replace with actual data
	const totalContentPromise = new Promise<number>((resolve) =>
		setTimeout(() => resolve(100), 30),
	);
	const categoriesCountPromise = new Promise<number>((resolve) =>
		setTimeout(() => resolve(392), 60),
	);
	const tagsCountPromise = new Promise<number>((resolve) =>
		setTimeout(() => resolve(678), 90),
	);

	return data({
		usersCountPromise,
		totalContentPromise,
		categoriesCountPromise,
		tagsCountPromise,
		nodeEnv: isProduction ? "production" : "development",
		metaEnv: import.meta.env,
	});
}

export default function AdminIndexRoute({
	loaderData: {
		usersCountPromise,
		totalContentPromise,
		categoriesCountPromise,
		tagsCountPromise,
		nodeEnv,
		metaEnv,
	},
}: Route.ComponentProps) {
	const user = useAuthUser();

	return (
		<div className="space-y-4">
			<h1 className="font-semibold text-xl">👋 Hi, {user.name}</h1>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Suspense fallback={<CardSkeleton />}>
					<Await
						resolve={usersCountPromise}
						errorElement={<div>Failed to load users count.</div>}
					>
						{(usersCount) => (
							<Card className="@container/card shadow-xs dark:bg-accent/30">
								<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6">
									<div className="flex flex-col space-y-1.5">
										<CardDescription>Users</CardDescription>
										<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
											{usersCount}
										</CardTitle>
									</div>
									<UsersIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								</CardHeader>
							</Card>
						)}
					</Await>
				</Suspense>

				<Suspense fallback={<CardSkeleton />}>
					<Await
						resolve={totalContentPromise}
						errorElement={<div>Failed to load total content.</div>}
					>
						{(totalContent) => (
							<Card className="@container/card shadow-xs dark:bg-accent/30">
								<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6">
									<div className="flex flex-col space-y-1.5">
										<CardDescription>Total Content</CardDescription>
										<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
											{totalContent}
										</CardTitle>
									</div>
									<FileStackIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								</CardHeader>
							</Card>
						)}
					</Await>
				</Suspense>

				<Suspense fallback={<CardSkeleton />}>
					<Await
						resolve={categoriesCountPromise}
						errorElement={<div>Failed to load categories count.</div>}
					>
						{(categoriesCount) => (
							<Card className="@container/card shadow-xs dark:bg-accent/30">
								<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6">
									<div className="flex flex-col space-y-1.5">
										<CardDescription>Categories</CardDescription>
										<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
											{categoriesCount}
										</CardTitle>
									</div>
									<FoldersIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								</CardHeader>
							</Card>
						)}
					</Await>
				</Suspense>

				<Suspense fallback={<CardSkeleton />}>
					<Await
						resolve={tagsCountPromise}
						errorElement={<div>Failed to load tags count.</div>}
					>
						{(tagsCount) => (
							<Card className="@container/card shadow-xs dark:bg-accent/30">
								<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6">
									<div className="flex flex-col space-y-1.5">
										<CardDescription>Tags</CardDescription>
										<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
											{tagsCount}
										</CardTitle>
									</div>
									<TagsIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								</CardHeader>
							</Card>
						)}
					</Await>
				</Suspense>
			</div>
			<p className="font-light font-serif text-muted-foreground/80 text-xs italic">
				Current Node Env: {nodeEnv}, Meta Env: {metaEnv.MODE}
			</p>
		</div>
	);
}

function CardSkeleton() {
	return (
		<Card className="@container/card shadow-xs">
			<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6">
				<div className="flex flex-1 flex-col space-y-1.5">
					<CardDescription>
						<Skeleton className="h-4 w-8/12" />
					</CardDescription>
					<CardTitle className="flex flex-col gap-1.5">
						<Skeleton className="h-4 w-5/12" />
						<Skeleton className="h-4 w-9/12" />
					</CardTitle>
				</div>
				<Skeleton className="mt-0.5 size-4 shrink-0 rounded-none" />
			</CardHeader>
		</Card>
	);
}
