import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';

import { prisma, prismaResult } from '$lib/server/prisma';
import { createExampleForm } from '$lib/server/application/exampleForm';
import { redirect } from '@sveltejs/kit';
import { Logger } from '$lib/utils/logger';
const log = new Logger('admin.forms.page.server');

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationFormsResult = await prismaResult(
		prisma.applicationFormDraft.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true
			}
		})
	);
	if (applicationFormsResult.isErr()) {
		log.error('Error loading application forms', applicationFormsResult.error);
		return { applicationForms: [], error: 'Unable to fetch application forms', user };
	}
	return {
		user,
		applicationForms: applicationFormsResult.value
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

		const newFormId = await prismaResult(
			prisma.applicationFormDraft.create({
				data: {
					name: formName,
					description: formDesc
				},
				select: { id: true }
			})
		);

		if (newFormId.isErr()) {
			log.error('Error creating form', newFormId.error);
			return { success: false, error: newFormId.error.message };
		}

		log.info(`New form draft created with ID: ${newFormId.value.id}`);
		return redirect(302, `/admin/form-drafts/${newFormId.value.id}`);
	},
	createExampleForm: async ({ locals }) => {
		requireRole(locals, 'ADMIN');

		await createExampleForm();
	}
	/**delete: async ({ request, locals }) => {
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
	}*/
} satisfies Actions;
