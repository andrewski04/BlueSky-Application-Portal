/*
 * Guard functions abstract the logic of checking if a user is authenticated and authorized.
 * They are meant to be used on PageServerLoads and API endpoints.
 */

import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { User, Session, UserRole } from '@prisma/client';

/**
 * Requires authentication to access the route, allowing ANY user to access the route.
 *
 * AUTH CHECKING IS NOT SECURE WHEN USED IN LAYOUT, be sure to check on a page level instead!!
 *
 * @param event - The request event object
 * @param redirectTo - The URL to redirect to if not authenticated or authorized (default: '/auth/login')
 * @returns user and session if authenticated and authorized
 * @example
 * export const load: PageServerLoad = (event) => {
 * 	const { user, session } = requireAuth(event); // will redirect to /auth/login if not authenticated
 * 	// ...
 *  return { user }
 * }
 */
export function requireAuth(
	event: RequestEvent,
	redirectTo: string = '/auth/login'
): { user: User; session: Session } {
	const { user, session } = event.locals;

	if (!user || !session) {
		throw redirect(303, redirectTo);
	}

	return { user, session };
}

/**
 * Requires authentication and authorization to access the route, allowing only users with the specified role to access the route.
 *
 * AUTH CHECKING IS NOT SECURE WHEN USED IN LAYOUT, be sure to check on a page level instead!!
 *
 * @param event - The request event object
 * @param role - The role to check for (`admin` or `user`)
 * @param redirectTo - The URL to redirect to if not authenticated or authorized (default: '/auth/login')
 * @returns user and session if authenticated and authorized
 * @example
 * export const load: PageServerLoad = (event) => {
 * 	const { user, session } = requireRole(event, 'admin'); // will redirect to /auth/login if not authenticated or not an admin
 * 	// ...
 *  return { user }
 * }
 */
export function requireRole(
	event: RequestEvent,
	role: UserRole,
	redirectTo: string = '/auth/login'
): { user: User; session: Session } {
	const { user, session } = requireAuth(event);

	if (!user.role || user.role !== role) {
		throw redirect(303, redirectTo);
	}

	return { user, session };
}

/**
 * Redirect a user to a specified route if they are already authenticated, by default it will redirect to respective role dashboard.
 *
 * @param event - The request event object
 * @param redirectTo - The URL to redirect to if authenticated (default: '/user/dashboard')
 * @throws {Redirect} Redirects to the specified route if the user is authenticated
 * @example
 * export const load: PageServerLoad = (event) => {
 * 	redirectIfAuthenticated(event); // will redirect to /user/dashboard if already logged in
 * }
 */
export function redirectIfAuthenticated(event: RequestEvent, redirectTo: string = '') {
	const { user, session } = event.locals;

	if (user && session) {
		if (redirectTo === '') {
			redirectTo = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
		}
		throw redirect(303, redirectTo);
	}
}
