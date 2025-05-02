import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth/guard';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
	requireAuth(event);
	throw redirect(303, '/user/dashboard');
}) satisfies PageServerLoad;
