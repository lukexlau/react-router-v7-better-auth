import {
	type FormContext,
	FormProvider,
	useField,
	useFormMetadata,
} from "@conform-to/react/future";
import type { VariantProps } from "class-variance-authority";
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import { Form as RouterForm } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "~/components/ui/input-group";
import { cn } from "~/lib/utils";
import { Button, type buttonVariants } from "./ui/button";
import { Spinner } from "./ui/spinner";

type FormProps = ComponentProps<typeof RouterForm> & {
	context: FormContext;
	className?: string;
	as?: FetcherWithComponents<unknown>["Form"] | typeof RouterForm;
	showErrors?: boolean;
};

export interface LoadingButtonProps
	extends React.ComponentProps<"button">,
		VariantProps<typeof buttonVariants> {
	buttonText: string;
	loadingText: string;
	isPending: boolean;
	className?: string;
}

export function FormErrors() {
	const form = useFormMetadata();

	if (Object.keys(form.fieldErrors).length === 0) {
		return null;
	}

	return (
		<Alert variant="destructive">
			<CircleAlertIcon />
			<AlertTitle>Please fix the following errors:</AlertTitle>
			<AlertDescription>
				<ul className="list-inside list-disc text-sm">
					{Object.entries(form.fieldErrors).map(([fieldName, errors]) => (
						<li key={fieldName}>{errors.join(", ")}</li>
					))}
				</ul>
			</AlertDescription>
		</Alert>
	);
}

export function Form({
	context,
	className,
	as: FormComponent = RouterForm,
	showErrors = false,
	children,
	...props
}: FormProps) {
	return (
		<FormProvider context={context}>
			<FormComponent
				className={cn("flex w-full flex-col gap-3", className)}
				{...props}
			>
				{showErrors && <FormErrors />}
				{children}
			</FormComponent>
		</FormProvider>
	);
}

export function LoadingButton({
	buttonText,
	loadingText,
	isPending,
	className = "",
	...props
}: LoadingButtonProps) {
	return (
		<Button type="submit" className={className} disabled={isPending} {...props}>
			{isPending ? (
				<>
					<Spinner /> {loadingText}
				</>
			) : (
				buttonText
			)}
		</Button>
	);
}

/**
 * PasswordField component using Conform's useField hook
 * Provides a password input with visibility toggle functionality
 *
 * @example
 * ```tsx
 * <PasswordField name="password" placeholder="Enter your password" />
 * ```
 */
export function PasswordField({
	name,
	placeholder = "••••••••••",
}: {
	name: string;
	placeholder?: string;
}) {
	const [isVisible, setIsVisible] = useState(false);
	const field = useField(name);

	return (
		<InputGroup>
			<InputGroupInput
				type={isVisible ? "text" : "password"}
				placeholder={placeholder}
				id={field.id}
				name={field.name}
				aria-label={isVisible ? "Hide password" : "Show password"}
				aria-invalid={!field.valid || undefined}
				aria-describedby={field.ariaDescribedBy}
			/>
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					type="button"
					aria-label={isVisible ? "Hide password" : "Show password"}
					title={isVisible ? "Hide password" : "Show password"}
					size="icon-xs"
					onClick={() => setIsVisible(!isVisible)}
				>
					{isVisible ? <EyeOffIcon /> : <EyeIcon />}
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}
