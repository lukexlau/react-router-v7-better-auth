/**
 * Application-wide Conform bindings (Zod v4 + custom field props).
 * Use hooks from here instead of `@conform-to/react/future` so SSR/client share one config.
 */
import type { BaseFieldMetadata, FormValue } from "@conform-to/react/future";
import { configureForms } from "@conform-to/react/future";
import {
	isSchema as conformIsZodSchema,
	formatResult,
	getConstraints,
} from "@conform-to/zod/v4/future";
import type { ComponentProps } from "react";
import type { Checkbox } from "~/components/ui/checkbox";
import type { Input } from "~/components/ui/input";
import type { RadioGroup } from "~/components/ui/radio-group";
import type { Select } from "~/components/ui/select";
import type { Switch } from "~/components/ui/switch";
import type { Textarea } from "~/components/ui/textarea";

/**
 * Define custom metadata for the form field (wired via `extendFieldMetadata` below).
 *
 * @example
 * ```tsx
 * const { fields } = useForm({ ... });
 *
 * <Field label="Email" field={fields.email}>
 *   <Input type="email" {...fields.email.inputProps} />
 * </Field>
 * ```
 *
 * @see {@link https://conform.guide/api/react/future/configureForms | Conform configureForms}
 */
export function defineCustomMetadata<FieldShape, ErrorShape>(
	metadata: BaseFieldMetadata<FieldShape, ErrorShape>,
) {
	return {
		get inputProps() {
			return {
				id: metadata.id,
				name: metadata.name,
				defaultValue: metadata.defaultValue,
				required: metadata.required,
				minLength: metadata.minLength,
				maxLength: metadata.maxLength,
				pattern: metadata.pattern,
				min: metadata.min,
				max: metadata.max,
				step: metadata.step,
				"aria-invalid": metadata.ariaInvalid,
				"aria-describedby": metadata.ariaDescribedBy,
			} satisfies Partial<ComponentProps<typeof Input>>;
		},
		get textareaProps() {
			return {
				id: metadata.id,
				name: metadata.name,
				defaultValue: metadata.defaultValue,
				required: metadata.required,
				"aria-invalid": metadata.ariaInvalid,
				"aria-describedby": metadata.ariaDescribedBy,
			} satisfies Partial<ComponentProps<typeof Textarea>>;
		},
		get selectProps() {
			return {
				name: metadata.name,
				defaultValue: metadata.defaultValue,
				required: metadata.required,
			} satisfies Partial<ComponentProps<typeof Select>>;
		},
		get checkboxProps() {
			return {
				name: metadata.name,
				value: "on",
				defaultChecked: metadata.defaultChecked,
			} satisfies Partial<ComponentProps<typeof Checkbox>>;
		},
		get radioGroupProps() {
			return {
				name: metadata.name,
				defaultValue: metadata.defaultValue,
			} satisfies Partial<ComponentProps<typeof RadioGroup>>;
		},
		get switchProps() {
			return {
				id: metadata.id,
				name: metadata.name,
				defaultChecked: metadata.defaultChecked,
				required: metadata.required,
			} satisfies Partial<ComponentProps<typeof Switch>>;
		},
	};
}

/** Custom field metadata merged by `configureForms` in this module. */
export type AppConformFieldMetadata = ReturnType<
	typeof defineCustomMetadata<unknown, unknown>
>;

type ZodSafeParseResult = Parameters<typeof formatResult>[0];

function validateSchema(
	schema: unknown,
	payload: Record<string, FormValue>,
	_options?: unknown,
) {
	const zodSchema = schema as {
		safeParse: (p: Record<string, FormValue>) => ZodSafeParseResult;
	};
	const result = zodSchema.safeParse(payload);
	// formatResult value is not parameterized to Conform's InferOutput<Schema>; cast matches configureForms contract
	// biome-ignore lint/suspicious/noExplicitAny: Conform validateSchema return must match generic InferOutput<Schema>
	return formatResult(result, { includeValue: true }) as any;
}

export const { FormProvider, useForm, useField, useFormMetadata, useIntent } =
	configureForms<
		string[],
		unknown,
		string[],
		Record<string, unknown>,
		AppConformFieldMetadata
	>({
		shouldValidate: "onSubmit",
		shouldRevalidate: "onInput",
		isSchema: conformIsZodSchema as (schema: unknown) => schema is unknown,
		validateSchema,
		getConstraints,
		extendFieldMetadata: (metadata) => defineCustomMetadata(metadata),
	});

export type { FormContext } from "@conform-to/react/future";
export { parseSubmission, report } from "@conform-to/react/future";
