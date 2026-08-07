import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";
import { useSpinDelay } from "spin-delay";
import { cn } from "~/lib/utils";
import { Spinner } from "./ui/spinner";

interface ProgressBarProps {
	showSpinner?: boolean;
}

function ProgressBar({ showSpinner = false }: ProgressBarProps) {
	const transition = useNavigation();
	const busy = transition.state !== "idle";
	const delayedPending = useSpinDelay(busy, {
		delay: 600,
		minDuration: 400,
	});
	const ref = useRef<HTMLDivElement>(null);
	const [animationComplete, setAnimationComplete] = useState(true);

	useEffect(() => {
		if (!ref.current) return;
		if (delayedPending) setAnimationComplete(false);

		const animationPromises = ref.current
			.getAnimations()
			.map(({ finished }) => finished);

		Promise.allSettled(animationPromises).then(() => {
			if (!delayedPending) setAnimationComplete(true);
		});
	}, [delayedPending]);

	return (
		<div
			aria-hidden={delayedPending ? undefined : true}
			className="pointer-events-none fixed inset-x-0 top-0 left-0 z-1000 h-[2.5px]"
		>
			<div
				ref={ref}
				className={cn(
					"relative h-full w-0 bg-blue-500 duration-500 ease-in-out",
					transition.state === "idle" &&
						(animationComplete
							? "transition-none"
							: "w-full opacity-0 transition-all"),
					delayedPending && transition.state === "submitting" && "w-5/12",
					delayedPending && transition.state === "loading" && "w-8/12",
				)}
			>
				{delayedPending && (
					<div
						className="absolute right-0 block h-full w-25 opacity-100"
						style={{
							boxShadow: "0 0 10px #3b82f6, 0 0 5px #3b82f6",
							transform: "rotate(3deg) translate(0px, -4px)",
						}}
					/>
				)}
			</div>
			{delayedPending && showSpinner && (
				<div className="fixed top-3.75 right-3.75 z-1000">
					<Spinner className="size-4.5 text-blue-500" />
				</div>
			)}
		</div>
	);
}

export { ProgressBar };
