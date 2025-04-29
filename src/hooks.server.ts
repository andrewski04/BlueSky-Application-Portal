import {
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie,
	getSessionTokenCookie
} from '$lib/server/auth/session';
import type { Handle } from '@sveltejs/kit';

// sets locals.session and locals.user for access on all routes
// If this is being used to check auth, use /lib/server/auth/guard.ts instead
export const handle: Handle = async ({ event, resolve }) => {
	// Get the session token from cookies
	const token = getSessionTokenCookie(event);

	if (!token) {
		// No session, ensure user is null
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// Validate the session token
	const { session, user } = await validateSessionToken(token);

	if (session) {
		// Refresh session expiration
		setSessionTokenCookie(event, token, session.expiresAt);
		event.locals.session = session;
		event.locals.user = user;
	} else {
		// If invalid, clear the session cookie
		deleteSessionTokenCookie(event);
		event.locals.session = null;
		event.locals.user = null;
	}

	return resolve(event);
};
