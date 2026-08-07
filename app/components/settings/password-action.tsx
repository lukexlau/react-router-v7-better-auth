import { useForm } from "@conform-to/react/future";
import { getZodConstraint } from "@conform-to/zod/v4";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { changePasswordSchema } from "~/lib/validations/auth";
import { authClient } from "~/services/auth/auth.client";
import { Form, LoadingButton, PasswordField } from "../forms";

export function ChangePassword() {
	const [isPending, setIsPending] = useState(false);
	const [open, setOpen] = useState(false);

	const { form, fields } = useForm(changePasswordSchema, {
		constraint: getZodConstraint(changePasswordSchema),
		onSubmit: async (e, { value }) => {
			e.preventDefault();

			if (isPending) return;
			setIsPending(true);

			const result = await authClient.changePassword({
				newPassword: value.newPassword,
				currentPassword: value.currentPassword,
				revokeOtherSessions: true,
			});

			if (result.error) {
				toast.error(result.error.message || "An unexpected error occurred.");
				setIsPending(false);
				return;
			}

			toast.success("Password changed successfully! Other sessions revoked.");
			setOpen(false);
			setIsPending(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Change Password
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Make changes to your password here. You can change your password and
						set a new password.
					</DialogDescription>
				</DialogHeader>
				<Form
					className="space-y-4"
					method="POST"
					context={form.context}
					{...form.props}
				>
					<Field>
						<FieldLabel htmlFor={fields.currentPassword.id}>
							Current Password
						</FieldLabel>
						<PasswordField name="currentPassword" />
						<FieldError
							errors={fields.currentPassword.errors?.map((error) => ({
								message: error,
							}))}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={fields.newPassword.id}>
							New Password
						</FieldLabel>
						<PasswordField name="newPassword" />
						<FieldError
							errors={fields.newPassword.errors?.map((error) => ({
								message: error,
							}))}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={fields.confirmPassword.id}>
							Confirm New Password
						</FieldLabel>
						<PasswordField name="confirmPassword" />
						<FieldError
							errors={fields.confirmPassword.errors?.map((error) => ({
								message: error,
							}))}
						/>
					</Field>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isPending}>
								Cancel
							</Button>
						</DialogClose>
						<LoadingButton
							buttonText="Save changes"
							loadingText="Saving..."
							isPending={isPending}
						/>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
