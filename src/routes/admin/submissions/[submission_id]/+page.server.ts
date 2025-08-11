import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { getApplicationFormWithAnswers } from '$lib/server/application/formResponseService';
import { prismaResult, prisma } from '$lib/server/prisma';
import { checkApplicationReadOnly } from '$lib/server/application/formResponseService';
const log = new Logger('Admin submissions page');

export const load = (async ({ locals, params }) => {
	requireRole(locals, 'ADMIN');

	const formResponseResult = await prismaResult(
		prisma.applicationResponse.findUnique({
			where: { id: params.submission_id },
			include: { form: { select: { id: true } }, user: true }
		})
	);

	if (formResponseResult.isErr() || !formResponseResult.value) {
		return { error: 'Application response not found' };
	}

	const formWithAnswersResult = await getApplicationFormWithAnswers(
		params.submission_id,
		formResponseResult.value.form.id
	);
	if (formWithAnswersResult.isErr()) {
		log.error('Error getting application response by ID', formWithAnswersResult.error);
		return { error: 'An error occurred while loading the application response.' };
	}
	if (!formWithAnswersResult.value) {
		return { error: 'Application response not found' };
	}

	const formWithAnswers = {
		...formWithAnswersResult.value,
		...formResponseResult.value
	};

	const { isReadOnly } = checkApplicationReadOnly({
		status: formResponseResult.value.status,
		form: formWithAnswersResult.value
	});

	return {
		formWithAnswers,
		isReadOnly
	};
}) satisfies PageServerLoad;
