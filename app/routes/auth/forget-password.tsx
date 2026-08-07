import { useForm } from "@conform-to/react/future";
import { getZodConstraint } from "@conform-to/zod/v4";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { AuthLayout } from "~/components/auth/auth-layout";
import { Form, LoadingButton } from "~/components/forms";
import { Field, FieldError } from "~/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "~/components/ui/input-group";
import { getPageTitle } from "~/lib/utils";
import { forgetPasswordSchema } from "~/lib/validations/auth";
import { authClient } from "~/services/auth/auth.client";

export function meta() {
	return [{ title: getPageTitle("Forgot your password?") }];
}

export default function ForgetPasswordRoute() {
	const [isPending, setIsPending] = useState(false);

	const { form, fields } = useForm(forgetPasswordSchema, {
		constraint: getZodConstraint(forgetPasswordSchema),
		shouldValidate: "onInput",
		onSubmit: async (e, { value }) => {
			e.preventDefault();

			if (isPending) return;
			setIsPending(true);

			const { error } = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: "/auth/reset-password",
			});

			if (error) {
				toast.error(error.message || "An unexpected error occurred.");
			} else {
				toast.success("Password reset link sent to your email!");
			}

			setIsPending(false);
		},
	});

	return (
		<AuthLayout
			title="Forgot your password?"
			description="Enter your email address and we will send you a password reset link."
		>
			<Form
				className="grid gap-4"
				method="POST"
				context={form.context}
				{...form.props}
			>
				<Field>
					<InputGroup>
						<InputGroupInput
							type="email"
							placeholder="Enter your email"
							id={fields.email.id}
							name={fields.email.name}
							defaultValue={fields.email.defaultValue}
							aria-invalid={!fields.email.valid || undefined}
							aria-describedby={fields.email.ariaDescribedBy}
						/>
						<InputGroupAddon>
							<InputGroupText>
								<MailIcon />
							</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<FieldError
						errors={fields.email.errors?.map((error) => ({
							message: error,
						}))}
					/>
				</Field>
				<LoadingButton
					buttonText="Send reset link"
					loadingText="Sending reset link..."
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
