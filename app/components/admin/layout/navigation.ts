import { GaugeIcon, SettingsIcon, ShieldIcon, UserCogIcon } from "lucide-react";
import type { ComponentType } from "react";
import { href } from "react-router";

export type IconType = ComponentType<{
	className?: string;
	size?: number | string;
}>;

export interface BaseNavItem {
	title: string;
	icon?: IconType;
	badge?: string | number;
}

export interface NavItemLink extends BaseNavItem {
	url: string;
	items?: undefined; // Discriminator to differentiate from NavItemCollapsible
}

export interface NavItemCollapsible extends BaseNavItem {
	items: NavItemLink[]; // Sub-items are always links and cannot have further sub-items
	url?: string; // Optional, for cases where the collapsible item itself might have a base path
}

export type NavItemUnion = NavItemLink | NavItemCollapsible;

export interface NavGroupData {
	id: string;
	title?: string;
	items: NavItemUnion[];
}

export const navigationGroups: NavGroupData[] = [
	{
		id: "nav-a",
		items: [
			{
				icon: GaugeIcon,
				title: "Dashboard",
				url: href("/admin"),
			},
		],
	},
	{
		id: "nav-b",
		title: "System Settings",
		items: [
			{
				icon: UserCogIcon,
				title: "Roles",
				url: "/admin/roles",
			},
			{
				icon: ShieldIcon,
				title: "Permissions",
				url: "/admin/permissions",
			},
			{
				title: "Settings",
				icon: SettingsIcon,
				items: [
					{
						title: "Cache Management",
						url: "/admin/cache",
					},
				],
			},
		],
	},
];
