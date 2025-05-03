import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
	requireRole(event, 'USER');
	throw redirect(303, '/user/dashboard');
}) satisfies PageServerLoad;
