import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createMagicToken } from '$lib/server/auth/magicToken';
import { sendMagicLink } from '$lib/server/mailer';
import { nanoid } from 'nanoid';
import { validateEmail } from '$lib/util/validation';
import { countRecentAttempts, recordAuthAttempt } from '$lib/server/auth/rateLimit';
import { AuthAttemptType } from '@prisma/client';

//TODO: redirect user if already logged in

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		const ipAddress =
			request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
			request.headers.get('x-real-ip') ||
			'';

		const userAgent = request.headers.get('user-agent') || '';

		if (!email || !validateEmail(email).isOk()) {
			return { success: false, error: 'Valid email is required' };
		}

		const loginWindowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000;
		const loginMax = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5;

		await recordAuthAttempt({
			email,
			ipAddress,
			userAgent,
			type: AuthAttemptType.LOGIN,
			success: false
		});

		const recentAttemptsFromIp = await countRecentAttempts({
			ipAddress,
			userAgent,
			type: AuthAttemptType.LOGIN,
			windowMs: loginWindowMs
		});

		if (recentAttemptsFromIp >= loginMax) {
			return { success: false, error: 'Too many login attempts. Please try again later.' };
		}

		// Create or reuse a device identifier cookie
		let deviceId = cookies.get('device_id');
		if (!deviceId) {
			deviceId = nanoid();
			cookies.set('device_id', deviceId, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 365
			});
		}
		try {
			const tokenResult = await createMagicToken(email, deviceId);
			if (tokenResult.isErr()) {
				return { success: false, error: tokenResult.error.message };
			}
			const { token } = tokenResult.unwrap();

			const baseUrl = `${url.protocol}//${url.host}`;

			const result = await sendMagicLink(email, token, baseUrl);
			if (result.isErr()) {
				return { success: false, error: result.error.message };
			}
		} catch {
			return { success: false, error: 'Unexpected error. Please try again.' };
		}

		throw redirect(303, `/auth/check-email?email=${encodeURIComponent(email)}`);
	}
} satisfies Actions;
