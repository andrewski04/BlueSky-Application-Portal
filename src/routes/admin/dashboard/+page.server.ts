import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';

import {
	getAllApplicationForms,
	deleteApplicationFormById,
	publishApplicationForm
} from '$lib/server/application/applicationFormService';
import { createExampleForm } from '$lib/server/application/exampleForm';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationForms = await getAllApplicationForms();
	if (applicationForms.isErr()) {
		return { applicationForms: [], error: applicationForms.error.message, user };
	}

	return {
		user,
		applicationForms: applicationForms.value
	};
}) satisfies PageServerLoad;

export const actions = {
	create: async () => {
		const exampleForm = await createExampleForm();
		await publishApplicationForm(exampleForm.applicationFormId);
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const formId = formData.get('formId')?.toString();

		if (!formId) {
			return { success: false, error: 'Form ID is required' };
		}

		const result = await deleteApplicationFormById(formId);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	}
};
