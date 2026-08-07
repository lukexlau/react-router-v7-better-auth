import { parseSubmission, report, useForm } from "@conform-to/react/future";
import { getConstraints } from "@conform-to/zod/v4/future";
import { and, eq, sql } from "drizzle-orm";
import { data, useNavigation } from "react-router";
import { Form, LoadingButton } from "~/components/forms";
import { TodoItem } from "~/components/todos/todo-item";
import { Input } from "~/components/ui/input";
import { getPageTitle } from "~/lib/utils";
import { todoSchema } from "~/lib/validations/todo";
import { requiredAuthContext } from "~/middlewares/auth";
import { db } from "~/services/db";
import { todos } from "~/services/db/schema";
import type { Route } from "./+types/todos";

export function meta() {
	return [{ title: getPageTitle("Todo List") }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const { user } = context.get(requiredAuthContext);
	const todosResult = await db.query.todos.findMany({
		where: (todo, { eq }) => eq(todo.userId, user.id),
		orderBy: (todo, { desc }) => [desc(todo.createdAt)],
	});
	return data({ todos: todosResult });
}

export async function action({ request, context }: Route.ActionArgs) {
	const { user } = context.get(requiredAuthContext);
	const formData = await request.formData();
	const submission = parseSubmission(formData);
	const payload = todoSchema.safeParse(submission.payload);

	if (!payload.success) {
		return data(
			report(submission, {
				error: {
					issues: payload.error.issues.map((issue) => ({
						path: issue.path.map(String),
						message: issue.message,
					})),
				},
			}),
			{ status: 400 },
		);
	}

	switch (payload.data.intent) {
		case "create":
			await db.insert(todos).values({
				title: payload.data.title,
				userId: user.id,
			});
			break;
		case "delete":
			await db
				.delete(todos)
				.where(
					and(eq(todos.id, Number(payload.data.id)), eq(todos.userId, user.id)),
				);
			break;
		case "toggle":
			await db
				.update(todos)
				.set({
					completed: sql`CASE WHEN completed = 0 THEN 1 ELSE 0 END`,
				})
				.where(
					and(eq(todos.id, Number(payload.data.id)), eq(todos.userId, user.id)),
				);
			break;
	}

	return data(report(submission, { reset: true }));
}

export default function TodosRoute({
	loaderData: { todos },
	actionData,
}: Route.ComponentProps) {
	const { form, fields } = useForm(todoSchema, {
		lastResult: actionData,
		constraint: getConstraints(todoSchema),
		shouldValidate: "onInput",
		defaultValue: {
			intent: "create",
		},
	});

	const navigation = useNavigation();
	const isSubmitting =
		navigation.state !== "idle" &&
		navigation.formData?.get("intent") === "create";

	return (
		<div className="space-y-6">
			<h1 className="font-bold text-xl">Todo List</h1>

			<Form method="POST" context={form.context} {...form.props}>
				<div className="flex gap-2">
					<Input
						placeholder="Add a todo"
						id={fields.title.id}
						name={fields.title.name}
						defaultValue={fields.title.defaultValue}
						aria-invalid={!fields.title.valid || undefined}
						aria-describedby={fields.title.ariaDescribedBy}
						type="text"
					/>
					<input
						id={fields.intent.id}
						name={fields.intent.name}
						defaultValue={fields.intent.defaultValue}
						type="hidden"
					/>
					<LoadingButton
						buttonText="Add"
						loadingText="Adding..."
						isPending={isSubmitting}
					/>
				</div>
				{fields.title.errors && (
					<p className="text-destructive" role="alert" aria-live="polite">
						{fields.title.errors.join(", ")}
					</p>
				)}
			</Form>

			{todos.length === 0 ? (
				<p className="text-muted-foreground text-sm">No todos found</p>
			) : (
				<ul className="divide-y overflow-hidden rounded-lg border shadow-xs">
					{todos.map((todo) => (
						<TodoItem key={todo.id} todo={todo} />
					))}
				</ul>
			)}
		</div>
	);
}
