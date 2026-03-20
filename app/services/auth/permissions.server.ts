import { auth } from "./auth.server";

export type PermissionPayload = Record<string, string[]>;

/**
 * Check if a user has a permission.
 * @param userId - The ID of the user to check permissions for.
 * @param permissions - Resource → actions map (matches admin plugin access control).
 * @param message - The message to display when the user is not authorized.
 */
export async function requirePermission(
	userId: string,
	permissions: PermissionPayload,
	message?: string,
) {
	const result = await auth.api.userHasPermission({
		body: { userId, permissions },
	});

	if (!result.success) {
		throw new Response(message ?? "You are not authorized to view this page.", {
			status: 403,
		});
	}

	return true;
}

/**
 * Check if a user has a permission.
 *
 * @param userId - The ID of the user to check permissions for.
 * @param permissions - Resource → actions map (matches admin plugin access control).
 */
export async function checkPermission(
	userId: string,
	permissions: PermissionPayload,
) {
	const result = await auth.api.userHasPermission({
		body: { userId, permissions },
	});

	return result.success;
}
