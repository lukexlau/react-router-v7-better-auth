import {
	ArrowRightIcon,
	CircleFadingPlusIcon,
	UserCogIcon,
} from "lucide-react";
import { href, Link } from "react-router";
import { GithubIcon } from "~/components/icons";
import { ThemeSwitcher } from "~/components/theme";
import { buttonVariants } from "~/components/ui/button";
import { useOptionalAuthUser } from "~/hooks/use-auth-user";
import { appDescription, appName } from "~/lib/config";
import { cn } from "~/lib/utils";

export function meta() {
	return [{ title: appName, description: appDescription }];
}

export default function IndexRoute() {
	const user = useOptionalAuthUser();

	return (
		<>
			<div className="flex h-[calc(100vh-300px)] flex-col items-center justify-center">
				<section className="flex flex-col items-center gap-6">
					<div className="bg-linear-to-b from-primary to-primary/60 bg-clip-text text-center font-extrabold font-serif text-5xl text-transparent italic leading-12 tracking-tight">
						React Router <br /> with Better Auth.
					</div>

					<p className="text-center font-mono text-base text-muted-foreground">
						{appDescription}
					</p>

					<div className="flex items-center gap-2">
						{user ? (
							<>
								<Link
									to={href("/todos")}
									className={cn(buttonVariants({ variant: "secondary" }))}
									reloadDocument
								>
									<CircleFadingPlusIcon />
									Create Todo
								</Link>

								<Link
									to={href("/settings/account")}
									className={cn(buttonVariants({ variant: "outline" }))}
								>
									<UserCogIcon />
									Account Settings
								</Link>
							</>
						) : (
							<>
								<Link
									to="https://github.com/foxlau/react-router-v7-better-auth"
									className={cn(buttonVariants({ variant: "outline" }))}
									reloadDocument
								>
									<GithubIcon />
									Star on Github
								</Link>

								<Link
									to={href("/auth/sign-in")}
									className={cn(buttonVariants({ variant: "outline" }))}
								>
									Get Started <ArrowRightIcon className="size-4" />
								</Link>
							</>
						)}
					</div>
				</section>
			</div>

			<div className="fixed inset-x-0 bottom-4 space-y-2 md:bottom-8">
				<div className="flex justify-center gap-x-2">
					<ThemeSwitcher />
				</div>
			</div>
		</>
	);
}
