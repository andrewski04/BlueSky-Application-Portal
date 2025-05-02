import type { PageServerLoad } from './$types';
import { redirectIfAuthenticated } from '$lib/server/auth/guard';

export const load = (async (event) => {
	redirectIfAuthenticated(event);
	return {};
}) satisfies PageServerLoad;
