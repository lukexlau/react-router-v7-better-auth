import { SidebarTrigger } from "~/components/ui/sidebar";
import { Breadcrumbs } from "./breadcrumbs";

export function AppHeader() {
	return (
		<header className="flex h-12 shrink-0 gap-2 border-border/60 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex w-full items-center px-4 sm:px-6">
				<SidebarTrigger className="mr-2 -ml-1.5" />
				<Breadcrumbs />
			</div>
		</header>
	);
}
