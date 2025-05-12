import type { PageServerLoad } from './$types';
import { getApplicationResponseById } from '$lib/server/application/applicationResponseService';
import { requireRole } from '$lib/server/auth/guard';
import { getApplicationFormById } from '$lib/server/application/applicationFormService';
import { Logger } from '$lib/utils/logger';

const log = new Logger('Admin submissions page');

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationResponse = await getApplicationResponseById(params.submission_id);
	if (applicationResponse.isErr()) {
		log.error('Error getting application response by ID', applicationResponse.error);
		return { error: applicationResponse.error.message, user };
	}
	if (!applicationResponse.value) {
		return { error: 'Application response not found', user };
	}

	const applicationForm = await getApplicationFormById(applicationResponse.value.formId);
	if (applicationForm.isErr()) {
		log.error('Error getting application form by ID', applicationForm.error);
		return { error: applicationForm.error.message, user };
	}
	if (!applicationForm.value) {
		return { error: 'Application form not found', user };
	}

	return {
		user,
		applicationResponse: applicationResponse.value,
		applicationForm: applicationForm.value
	};
}) satisfies PageServerLoad;
