import { useForm } from "@conform-to/react/future";
import { getZodConstraint } from "@conform-to/zod/v4";
import { useState } from "react";
import { data, href, Link, redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import { AuthLayout } from "~/components/auth/auth-layout";
import { Form, LoadingButton, PasswordField } from "~/components/forms";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { getPageTitle } from "~/lib/utils";
import { resetPasswordSchema } from "~/lib/validations/auth";
import { authClient } from "~/services/auth/auth.client";
import type { Route } from "./+types/reset-password";

export function meta() {
	return [{ title: getPageTitle("Reset Password") }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");
	if (!token) return redirect("/auth/sign-in");
	return data({ token });
}

export default function ResetPasswordRoute({
	loaderData: { token },
}: Route.ComponentProps) {
	const [isPending, setIsPending] = useState(false);
	const navigate = useNavigate();

	const { form, fields } = useForm(resetPasswordSchema, {
		constraint: getZodConstraint(resetPasswordSchema),
		defaultValue: { token },
		shouldValidate: "onInput",
		onSubmit: async (e, { value }) => {
			e.preventDefault();

			if (isPending) return;
			setIsPending(true);

			const { error } = await authClient.resetPassword({
				newPassword: value.newPassword,
				token: value.token,
			});

			if (error) {
				toast.error(error.message || "An unexpected error occurred.");
				setIsPending(false);
				return;
			}

			toast.success("Password reset successfully! Please sign in again.");
			navigate(href("/auth/sign-in"));
		},
	});

	return (
		<AuthLayout
			title="Reset your password"
			description="Enter your new password below, minimum 8 characters, maximum 32 characters."
		>
			<Form
				className="grid gap-4"
				method="POST"
				context={form.context}
				{...form.props}
			>
				<input type="hidden" name="token" value={token} />
				<Field>
					<FieldLabel htmlFor={fields.newPassword.id}>New Password</FieldLabel>
					<PasswordField name={fields.newPassword.name} />
					{fields.newPassword.errors && (
						<FieldError
							errors={fields.newPassword.errors.map((error) => ({
								message: typeof error === "string" ? error : String(error),
							}))}
						/>
					)}
				</Field>
				<Field>
					<FieldLabel htmlFor={fields.confirmPassword.id}>
						Confirm New Password
					</FieldLabel>
					<PasswordField name={fields.confirmPassword.name} />
					{fields.confirmPassword.errors && (
						<FieldError
							errors={fields.confirmPassword.errors.map((error) => ({
								message: typeof error === "string" ? error : String(error),
							}))}
						/>
					)}
				</Field>
				<LoadingButton
					buttonText="Reset Password"
					loadingText="Resetting password..."
					isPending={isPending}
				/>
			</Form>

			<div className="text-center text-sm">
				<Link to="/auth/sign-in" className="text-primary hover:underline">
					← Back to sign in
				</Link>
			</div>
		</AuthLayout>
	);
}
