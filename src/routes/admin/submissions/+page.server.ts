import type { PageServerLoad } from './$types';
import { getAllApplicationResponsesWithUser } from '$lib/server/application/applicationResponseService';
import { requireRole } from '$lib/server/auth/guard';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationResponses = await getAllApplicationResponsesWithUser();
	if (applicationResponses.isErr()) {
		console.error(applicationResponses.error);
		return { error: applicationResponses.error.message, user };
	}

	return { applicationResponses: applicationResponses.value, user };
}) satisfies PageServerLoad;
