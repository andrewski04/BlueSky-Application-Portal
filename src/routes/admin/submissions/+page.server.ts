import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';

export const load = (async ({ locals }) => {
	await requireRole(locals, 'ADMIN');
	// see +server.ts for the actual data fetching
	return {};
}) satisfies PageServerLoad;
