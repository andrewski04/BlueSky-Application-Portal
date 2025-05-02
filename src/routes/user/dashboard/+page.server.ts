import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth/guard';

export const load = (async (event) => {
	const { user } = requireAuth(event);

	return {
		user
	};
}) satisfies PageServerLoad;
