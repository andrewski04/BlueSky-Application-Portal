import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth/guard';

export const load: PageServerLoad = (async ({ locals }) => {
	const { user } = requireAuth(locals);

	return {
		user
	};
}) satisfies PageServerLoad;
