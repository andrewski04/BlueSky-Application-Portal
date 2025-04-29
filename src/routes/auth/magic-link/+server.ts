/**
 * This handles the action taken when the user clicks on a magic link for logging in.
 * If the user is on the same device, they are authenticated and redirected.
 * If the user is on a different device, they are shown the OTP page.
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findMagicTokenByToken } from '$lib/server/auth/magicToken';
import { authenticateUserWithMagicToken } from '$lib/server/auth/authService';
import { setSessionTokenCookie } from '$lib/server/auth/session';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(303, '/auth/login?error=invalid_token');
	}

	// device_id, set on login page, used to check if user is on the same device
	const deviceId = cookies.get('device_id');

	const magicToken = await findMagicTokenByToken(token);

	if (!magicToken) {
		throw redirect(303, '/auth/login?error=invalid_token');
	}

	// if on same device, authenticate user and redirect
	if (deviceId && deviceId === magicToken.deviceId) {
		const authResult = await authenticateUserWithMagicToken({
			email: magicToken.email,
			hashedMagicToken: magicToken.hashedToken,
			redirectTo: '/'
		});

		if (authResult.isErr()) {
			throw redirect(303, `/auth/login?error=${authResult.error.code}`);
		}

		const { redirectTo, token, expiresAt } = authResult.unwrap();
		setSessionTokenCookie({ cookies }, token, expiresAt);

		throw redirect(303, redirectTo);
	}

	throw redirect(303, `/auth/otp?token=${token}`);
};
