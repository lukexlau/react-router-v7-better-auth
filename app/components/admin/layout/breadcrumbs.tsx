import React, { useMemo } from "react";
import { Link, type UIMatch, useMatches } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export interface BreadcrumbItemInfo {
	label: string;
	to?: string;
}

export interface ProcessedBreadcrumbItem extends BreadcrumbItemInfo {
	isCurrentPage: boolean;
}

interface RouteHandleWithBreadcrumb {
	breadcrumb: (routeData: unknown) => BreadcrumbItemInfo | BreadcrumbItemInfo[];
}

function routeHasBreadcrumb(
	match: UIMatch<unknown, unknown>,
): match is UIMatch<unknown, RouteHandleWithBreadcrumb> {
	const handle = match.handle as Partial<RouteHandleWithBreadcrumb> | undefined;
	return (
		typeof handle === "object" &&
		handle !== null &&
		typeof handle.breadcrumb === "function"
	);
}

export const Breadcrumbs: React.FC = () => {
	const matches = useMatches();

	const items = useMemo(() => {
		const relevantMatches = matches.filter(routeHasBreadcrumb);

		// Flatten all breadcrumb items
		const allItems: ProcessedBreadcrumbItem[] = [];

		for (const match of relevantMatches) {
			const itemInfo = match.handle.breadcrumb(match.loaderData);
			const itemsArray = Array.isArray(itemInfo) ? itemInfo : [itemInfo];

			for (const item of itemsArray) {
				allItems.push({
					...item,
					isCurrentPage: false, // Will be set later
				});
			}
		}

		// Mark the last item as current page
		const lastItem = allItems[allItems.length - 1];
		if (lastItem) {
			lastItem.isCurrentPage = true;
		}

		return allItems;
	}, [matches]);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, idx) => (
					<React.Fragment key={`${item.label}-${idx}`}>
						{idx > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{item.to && !item.isCurrentPage ? (
								<BreadcrumbLink asChild>
									<Link to={item.to}>{item.label}</Link>
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
