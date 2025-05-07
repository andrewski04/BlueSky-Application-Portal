import type { PageServerLoad } from './$types';
import {
	getAllApplicationForms,
	deleteApplicationFormById,
	publishApplicationForm
} from '$lib/server/application/applicationFormService';
import { createExampleForm } from '$lib/server/application/exampleForm';

export const load = (async () => {
	const applicationForms = await getAllApplicationForms();
	if (applicationForms.isErr()) {
		return { applicationForms: [], error: applicationForms.error.message };
	}
	return { applicationForms: applicationForms.value };
}) satisfies PageServerLoad;

export const actions = {
	create: async () => {
		const exampleForm = await createExampleForm();
		console.log(exampleForm.applicationFormId);
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
