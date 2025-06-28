import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { prisma, prismaResult } from '$lib/server/prisma';

const log = new Logger('submissions');

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationResponses = await prismaResult(
		prisma.applicationResponse.findMany({
			include: {
				user: true
			}
		})
	);
	if (applicationResponses.isErr()) {
		log.error('Error getting all application responses', applicationResponses.error);
		return { error: applicationResponses.error.message, user };
	}

	return { applicationResponses: applicationResponses.value, user };
}) satisfies PageServerLoad;
