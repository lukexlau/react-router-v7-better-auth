import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import type { Todo } from "~/services/db/schema";

export function TodoItem({ todo }: { todo: Todo }) {
	const fetcher = useFetcher();
	const [isChecked, setIsChecked] = useState(Boolean(todo.completed));
	const isSubmitting = fetcher.state !== "idle";
	const id = todo.id.toString();

	return (
		<li
			key={todo.id}
			className="flex items-center gap-2 p-2 pl-3 hover:bg-accent"
		>
			<label htmlFor={id} className="flex items-center gap-2">
				<Checkbox
					id={id}
					name={id}
					disabled={isSubmitting}
					checked={isChecked}
					onCheckedChange={() => {
						setIsChecked(!isChecked);
						fetcher.submit(
							{
								intent: "toggle",
								id,
							},
							{ method: "POST", preventScrollReset: true },
						);
					}}
				/>
				<span
					className={cn("font-medium", {
						"text-muted-foreground line-through": isChecked,
					})}
				>
					{todo.title}
				</span>
			</label>
			<Button
				type="submit"
				className="ml-auto size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
				size="icon"
				variant="ghost"
				disabled={isSubmitting}
				onClick={() => {
					fetcher.submit(
						{
							intent: "delete",
							id,
						},
						{ method: "POST", preventScrollReset: true },
					);
				}}
			>
				<TrashIcon className="size-4" />
			</Button>
		</li>
	);
}
