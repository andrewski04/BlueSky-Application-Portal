import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';

import {
	getAllApplicationForms,
	deleteApplicationFormById,
	publishApplicationForm,
	createApplicationForm
} from '$lib/server/application/applicationFormService';
import { createExampleForm } from '$lib/server/application/exampleForm';
import { redirect } from '@sveltejs/kit';
import { Logger } from '$lib/utils/logger';
const log = new Logger('admin.forms.page.server');

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
	createForm: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const formName = formData.get('formName')?.toString();
		const formDesc = formData.get('formDescription')?.toString();
		if (!formName) {
			return { success: false, error: 'Form name is required' };
		}

		const newFormId = await createApplicationForm({
			name: formName,
			description: formDesc
		});

		if (newFormId.isErr()) {
			log.error('Error creating form', newFormId.error);
			return { success: false, error: newFormId.error.message };
		}

		log.info('New form created with ID:', newFormId.value.applicationFormId);
		return redirect(302, `/admin/forms/${newFormId.value.applicationFormId}`);
	},
	createExampleForm: async ({ locals }) => {
		requireRole(locals, 'ADMIN');

		const exampleForm = await createExampleForm();
		await publishApplicationForm(exampleForm.applicationFormId);
	},
	delete: async ({ request, locals }) => {
		requireRole(locals, 'ADMIN');

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
} satisfies Actions;
