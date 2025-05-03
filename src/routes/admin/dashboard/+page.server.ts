import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
	const { user } = requireRole(event, 'ADMIN');

	if (!user.isSetup) {
		throw redirect(303, '/user/account-setup');
	}

	return {
		user
	};
}) satisfies PageServerLoad;
