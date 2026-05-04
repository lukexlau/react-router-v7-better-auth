import { getZodConstraint } from "@conform-to/zod/v4";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { AuthLayout } from "~/components/auth/auth-layout";
import { Form, LoadingButton, PasswordField } from "~/components/forms";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useForm } from "~/lib/conform";
import { getPageTitle } from "~/lib/utils";
import { signUpSchema } from "~/lib/validations/auth";
import { authClient } from "~/services/auth/client";

export function meta() {
	return [{ title: getPageTitle("Sign Up") }];
}

export default function SignUpRoute() {
	const [isPending, setIsPending] = useState(false);
	const navigate = useNavigate();

	const { form, fields } = useForm(signUpSchema, {
		constraint: getZodConstraint(signUpSchema),
		onSubmit: async (e, { value }) => {
			e.preventDefault();

			if (isPending) return;
			setIsPending(true);

			const { error } = await authClient.signUp.email({
				callbackURL: "/",
				...value,
			});

			if (error) {
				toast.error(error.message || "An unexpected error occurred.");
				setIsPending(false);
				return;
			}

			toast.success(
				"Sign up successful! Please check your email for a verification link.",
			);
			navigate("/auth/sign-in");
		},
	});

	return (
		<AuthLayout
			title="Create your account"
			description="Welcome! Please fill in the details to get started."
		>
			{/* Sign up form */}
			<Form
				className="grid gap-4"
				method="POST"
				context={form.context}
				{...form.props}
			>
				<Field>
					<FieldLabel htmlFor={fields.name.id}>Name</FieldLabel>
					<Input
						{...fields.name.inputProps}
						placeholder="John Doe"
						autoComplete="name"
						enterKeyHint="next"
						type="text"
						required
					/>
					<FieldError
						errors={fields.name.errors?.map((error) => ({
							message: error,
						}))}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
					<Input
						{...fields.email.inputProps}
						placeholder="johndoe@example.com"
						autoComplete="email"
						enterKeyHint="next"
						type="email"
					/>
					<FieldError
						errors={fields.email.errors?.map((error) => ({
							message: error,
						}))}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor={fields.password.id}>Password</FieldLabel>
					<PasswordField
						name="password"
						placeholder="Enter a unique password"
					/>
					<FieldError
						errors={fields.password.errors?.map((error) => ({
							message: error,
						}))}
					/>
				</Field>
				<LoadingButton
					buttonText="Sign Up"
					loadingText="Signing up..."
					isPending={isPending}
				/>
			</Form>

			{/* Terms of service */}
			<div className="text-balance text-center text-muted-foreground text-xs">
				By clicking continue, you agree to our{" "}
				<a href="/" className="text-primary hover:underline">
					Terms of Service
				</a>
				{" and "}
				<a href="/" className="text-primary hover:underline">
					Privacy Policy
				</a>
				.
			</div>

			{/* Sign in */}
			<div className="text-center text-sm">
				Already have an account?{" "}
				<Link to="/auth/sign-in" className="text-primary hover:underline">
					Sign in
				</Link>
			</div>
		</AuthLayout>
	);
}
