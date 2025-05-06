import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateSessionToken, getSessionTokenCookie } from '$lib/server/auth/session';
import { requireAuth } from '$lib/server/auth/guard';
import { userSetupByUserId } from '$lib/server/auth/user';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = requireAuth(locals);
	const redirectTo = url.searchParams.get('redirect');

	// this should implement User field `account-setup` or something
	if (user.isSetup) {
		throw redirect(303, redirectTo || '/user/dashboard');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			firstName: user.firstName || '',
			lastName: user.lastName || ''
		}
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const userId = formData.get('userId') as string;
		const redirectTo = url.searchParams.get('redirect');

		const sessionToken = getSessionTokenCookie({ cookies });
		if (!sessionToken) {
			return { success: false, error: 'Authentication required' };
		}

		const { user } = await validateSessionToken(sessionToken);
		if (!user || user.id !== userId) {
			return { success: false, error: 'Invalid session' };
		}

		const result = await userSetupByUserId(userId, firstName, lastName);

		if (result.isErr()) {
			return {
				success: false,
				error: result.error.message,
				firstName,
				lastName
			};
		}

		throw redirect(303, redirectTo || '/user/dashboard');
	}
};
