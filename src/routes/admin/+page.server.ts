import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	requireRole(locals, 'ADMIN');
	throw redirect(303, '/admin/dashboard');
}) satisfies PageServerLoad;
