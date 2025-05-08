import type { PageServerLoad } from './$types';
import { getApplicationResponseById } from '$lib/server/application/applicationResponseService';
import { requireRole } from '$lib/server/auth/guard';
import { getApplicationFormById } from '$lib/server/application/applicationFormService';

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationResponse = await getApplicationResponseById(params.submission_id);
	if (applicationResponse.isErr()) {
		console.error(applicationResponse.error);
		return { error: applicationResponse.error.message, user };
	}
	if (!applicationResponse.value) {
		return { error: 'Application response not found', user };
	}

	const applicationForm = await getApplicationFormById(applicationResponse.value.formId);
	if (applicationForm.isErr()) {
		console.error(applicationForm.error);
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
