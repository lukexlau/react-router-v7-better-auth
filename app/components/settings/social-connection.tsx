import type { FC, SVGProps } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authClient } from "~/services/auth/auth.client";
import { DateTimeDisplay } from "../datetime-display";
import { LoadingButton } from "../forms";

export function SocialConnection({
	connection,
}: {
	connection: {
		provider: "github" | "google";
		displayName: string;
		icon: FC<SVGProps<SVGSVGElement>>;
		isConnected: boolean;
		createdAt?: Date | null;
	};
}) {
	const navigate = useNavigate();
	const [isConnecting, setIsConnecting] = useState(false);
	const variant = connection.isConnected ? "secondary" : "outline";
	const label = connection.isConnected ? "Disconnect" : "Connect";

	const handleLinkSocial = async () => {
		setIsConnecting(true);
		const { error } = await authClient.linkSocial({
			provider: connection.provider,
			callbackURL: "/settings/connections",
		});
		if (error) {
			toast.error(error.message || "Failed to connect.");
		}
	};

	const handleUnlinkSocial = async () => {
		setIsConnecting(true);
		const { error } = await authClient.unlinkAccount({
			providerId: connection.provider,
		});
		if (error) {
			toast.error(error.message || "Failed to disconnect.");
		}
		setIsConnecting(false);
		navigate(".");
	};

	return (
		<div className="flex flex-col gap-2 px-4 py-3 hover:bg-accent">
			<div className="flex items-center gap-2">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
					<connection.icon className="size-5" />
				</div>
				<div className="flex flex-col gap-0.5">
					<p className="font-medium text-sm">{connection.displayName}</p>
					<p className="text-muted-foreground text-xs">
						{connection.isConnected && connection.createdAt ? (
							<>
								Connected on{" "}
								<DateTimeDisplay
									className="text-xs"
									date={connection.createdAt}
								/>
							</>
						) : (
							"Not connected"
						)}
					</p>
				</div>
				<div className="ml-auto">
					<LoadingButton
						size="sm"
						variant={variant}
						buttonText={label}
						loadingText={isConnecting ? "Connecting..." : "Disconnecting..."}
						isPending={isConnecting}
						onClick={
							connection.isConnected ? handleUnlinkSocial : handleLinkSocial
						}
					/>
				</div>
			</div>
		</div>
	);
}
