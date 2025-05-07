import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createMagicToken } from '$lib/server/auth/magicToken';
import { sendMagicLink } from '$lib/server/mailer';
import { nanoid } from 'nanoid';
import { validateEmail } from '$lib/utils/validation';

import { findUserByEmail } from '$lib/server/auth/user';
import type { PageServerLoad } from './$types';
import { redirectIfAuthenticated } from '$lib/server/auth/guard';

export const load = (async ({ locals }) => {
	redirectIfAuthenticated(locals);
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email || !validateEmail(email).isOk()) {
			return { success: false, error: 'Valid email address required.' };
		}

		if (!(await findUserByEmail(email))) {
			return { success: false, error: 'No user found, try registering instead.' };
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
