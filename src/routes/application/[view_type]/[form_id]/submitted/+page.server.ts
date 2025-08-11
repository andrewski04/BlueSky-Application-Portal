import { requireAuth } from '$lib/server/auth/guard';
import type { PageServerLoad } from './$types';
import { prisma, prismaResult } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const userId = user.id;

	const applicationResponse = await prismaResult(
		prisma.applicationResponse.findUnique({
			where: { userId_formId: { userId, formId } }
		})
	);

	if (applicationResponse.isErr() || !applicationResponse.value) {
		throw error(404, 'Application response not found');
	}

	if (applicationResponse.value.status !== 'SUBMITTED') {
		throw error(404, 'Application has not been submitted');
	}

	return {
		applicationResponse: applicationResponse.value
	};
}) satisfies PageServerLoad;
