import type { PageServerLoad } from './$types';
import { prisma, prismaResult } from '$lib/server/prisma';
import { requireRole } from '$lib/server/auth/guard';

export const load = (async ({ locals }) => {
	requireRole(locals, 'ADMIN');

	const publishedForms = await prismaResult(
		prisma.applicationFormPublished.findMany({
			orderBy: { publishedAt: 'desc' }
		})
	);
	if (publishedForms.isErr()) {
		return { error: 'Failed to fetch published forms' };
	}
	return { publishedForms: publishedForms.value };
}) satisfies PageServerLoad;
