import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { createExampleForm } from '$lib/server/application/exampleForm';
import { redirect, fail, error } from '@sveltejs/kit';
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
			},
			orderBy: {
				updatedAt: 'desc'
			}
		})
	);
	if (applicationFormsResult.isErr()) {
		log.error('Error loading application forms', applicationFormsResult.error);
		return error(500, 'Unable to fetch application forms');
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
			return fail(400, { success: false, error: 'Form name is required' });
		}

		const newFormResult = await prismaResult(
			prisma.applicationFormDraft.create({
				data: {
					name: formName,
					description: formDesc
				}
			})
		);

		if (newFormResult.isErr()) {
			log.error('Error creating form', newFormResult.error);
			return fail(500, { success: false, error: 'Error creating form' });
		}

		return { success: true, message: 'Form created successfully.', form: newFormResult.value };
	},
	createExampleForm: async ({ locals }) => {
		requireRole(locals, 'ADMIN');

		const result = await createExampleForm();
		if (result.isErr()) {
			log.error('Error creating example form', result.error);
			return fail(500, { success: false, error: 'Error creating example form' });
		}
		return { success: true, message: 'Example form created successfully.', form: result.value };
	},
	deleteDraft: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const formId = formData.get('formId')?.toString();

		if (!formId) {
			return { success: false, error: 'Form ID is required' };
		}

		const result = await prismaResult(
			prisma.applicationFormDraft.delete({
				where: {
					id: formId
				}
			})
		);

		if (result.isErr()) {
			log.error('Error deleting form draft', result.error);
			return fail(500, {
				success: false,
				error: 'An error occurred while deleting the form draft.'
			});
		}

		return { success: true, message: 'Form draft deleted successfully.' };
	},
	publishDraft: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const formId = formData.get('formId')?.toString();

		if (!formId) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		// Import the publish function
		const { publishFormFromDraft } = await import('$lib/server/application/formService');
		const publishRes = await publishFormFromDraft(formId, { active: false });

		if (publishRes.isErr()) {
			log.error('Error publishing form draft', publishRes.error);
			return fail(500, { success: false, error: 'Error publishing form draft' });
		}

		return redirect(302, `/admin/published-forms/${publishRes.value.publishedId}`);
	}
} satisfies Actions;
