import { useForm } from "@conform-to/react/future";
import { getZodConstraint } from "@conform-to/zod/v4";
import { useEffect, useState } from "react";
import { href, Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { AuthLayout } from "~/components/auth/auth-layout";
import { LastUsedBadge } from "~/components/auth/last-used-badge";
import { Form, LoadingButton, PasswordField } from "~/components/forms";
import { GithubIcon, GoogleIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { getPageTitle } from "~/lib/utils";
import { signInSchema } from "~/lib/validations/auth";
import { authClient } from "~/services/auth/auth.client";

export function meta() {
	return [{ title: getPageTitle("Sign In") }];
}

export default function SignInRoute() {
	const [lastUsedMethod, setLastUsedMethod] = useState<string | null>(null);
	const [isSignInPending, setIsSignInPending] = useState(false);
	const [isSocialSignInPending, setIsSocialSignInPending] = useState(false);
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");
	const callbackURL = redirectTo ? decodeURIComponent(redirectTo) : "/";

	const { form, fields } = useForm(signInSchema, {
		constraint: getZodConstraint(signInSchema),
		shouldValidate: "onInput",
		onSubmit: async (e, { value }) => {
			e.preventDefault();
			if (isSignInPending) return;
			setIsSignInPending(true);

			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
				callbackURL,
			});
			if (error) {
				toast.error(error.message || "Invalid email or password.");
			}

			setIsSignInPending(false);
		},
	});

	const handleSocialSignIn = async (provider: "github" | "google") => {
		if (isSocialSignInPending) return;
		setIsSocialSignInPending(true);

		const { error } = await authClient.signIn.social({
			provider,
			callbackURL,
		});
		if (error) {
			toast.error(error.message || `Unable to sign in with ${provider}.`);
		}

		setIsSocialSignInPending(false);
	};

	useEffect(() => {
		const _lastUsedMethod = authClient.getLastUsedLoginMethod();
		setLastUsedMethod(_lastUsedMethod);
	}, []);

	return (
		<AuthLayout
			title="Sign in to your account"
			description="Welcome back! Please sign in to continue."
		>
			{/* Sign in form */}
			<Form
				className="grid gap-4"
				method="POST"
				context={form.context}
				{...form.props}
			>
				<Field>
					<FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
					<Input
						placeholder="your@email.com"
						autoComplete="on"
						type="email"
						id={fields.email.id}
						name={fields.email.name}
						defaultValue={fields.email.defaultValue}
						aria-invalid={!fields.email.valid || undefined}
						aria-describedby={fields.email.ariaDescribedBy}
					/>
					<FieldError
						errors={fields.email.errors?.map((error) => ({
							message: error,
						}))}
					/>
				</Field>
				<Field>
					<div className="flex items-center">
						<FieldLabel htmlFor={fields.password.id}>Password</FieldLabel>
						<Link
							to={href("/auth/forget-password")}
							className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
						>
							Forgot your password?
						</Link>
					</div>
					<PasswordField name={fields.password.name} placeholder="••••••••••" />
					<FieldError
						errors={fields.password.errors?.map((error) => ({
							message: error,
						}))}
					/>
				</Field>
				<input type="hidden" name="provider" value="Email" />
				<div className="relative overflow-hidden rounded-lg">
					<LoadingButton
						className="w-full"
						buttonText="Sign In"
						loadingText="Signing in..."
						isPending={isSignInPending}
						disabled={isSocialSignInPending || isSignInPending}
					/>
					{lastUsedMethod === "email" && <LastUsedBadge />}
				</div>
			</Form>

			<div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
				<span className="relative z-10 bg-background px-2 text-muted-foreground">
					Or continue with
				</span>
			</div>

			<div className="grid gap-2">
				<Button
					onClick={() => handleSocialSignIn("github")}
					variant="outline"
					className="relative w-full overflow-hidden"
					disabled={isSocialSignInPending || isSignInPending}
				>
					<GithubIcon className="size-4" />
					<span>Login with GitHub</span>
					{lastUsedMethod === "github" && <LastUsedBadge />}
				</Button>
				<Button
					onClick={() => handleSocialSignIn("google")}
					variant="outline"
					className="relative w-full overflow-hidden"
					disabled={isSocialSignInPending || isSignInPending}
				>
					<GoogleIcon className="size-4" />
					<span>Login with Google</span>
					{lastUsedMethod === "google" && <LastUsedBadge />}
				</Button>
			</div>

			{/* Sign up */}
			<div className="text-center text-sm">
				Don&apos;t have an account?{" "}
				<Link to="/auth/sign-up" className="text-primary hover:underline">
					Sign up
				</Link>
			</div>
		</AuthLayout>
	);
}
