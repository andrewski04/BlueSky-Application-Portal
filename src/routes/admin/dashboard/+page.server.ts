import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	return {
		user
	};
}) satisfies PageServerLoad;
