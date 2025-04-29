import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import {
	invalidateSession,
	deleteSessionTokenCookie,
	getSessionTokenCookie,
	validateSessionToken
} from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionToken = getSessionTokenCookie({ cookies });
	if (!sessionToken) {
		throw redirect(303, '/');
	}

	const result = await validateSessionToken(sessionToken);
	if (!result?.session || !result?.user) {
		deleteSessionTokenCookie({ cookies });
		throw redirect(303, '/');
	}

	await invalidateSession(sessionToken, false);
	deleteSessionTokenCookie({ cookies });
	throw redirect(303, '/');
};
