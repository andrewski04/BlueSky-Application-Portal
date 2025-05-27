import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { getApplicationFormById } from '$lib/server/application/applicationFormService';
import { Logger } from '$lib/utils/logger';

const log = new Logger('Admin submissions page');

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationForm = await getApplicationFormById(params.form_id);
	if (applicationForm.isErr()) {
		log.error('Error getting application form by ID', applicationForm.error);
		return { error: applicationForm.error.message, user };
	}
	if (!applicationForm.value) {
		return { error: 'Application form not found', user };
	}

	return {
		user,
		applicationForm: applicationForm.value
	};
}) satisfies PageServerLoad;
