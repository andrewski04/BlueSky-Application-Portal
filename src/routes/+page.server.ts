import type { PageServerLoad } from './$types';
import { redirectIfAuthenticated } from '$lib/server/auth/guard';

export const load = (async ({ locals }) => {
	redirectIfAuthenticated(locals);
	return {};
}) satisfies PageServerLoad;
