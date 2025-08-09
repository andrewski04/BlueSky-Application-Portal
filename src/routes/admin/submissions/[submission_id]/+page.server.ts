import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { getApplicationFormWithAnswers } from '$lib/server/application/formResponseService';

const log = new Logger('Admin submissions page');

export const load = (async ({ locals, params }) => {
	requireRole(locals, 'ADMIN');

	const formWithAnswersResult = await getApplicationFormWithAnswers(params.submission_id);
	if (formWithAnswersResult.isErr()) {
		log.error('Error getting application response by ID', formWithAnswersResult.error);
		return { error: 'An error occurred while loading the application response.' };
	}
	if (!formWithAnswersResult.value) {
		return { error: 'Application response not found' };
	}

	return {
		formWithAnswers: formWithAnswersResult.value
	};
}) satisfies PageServerLoad;
