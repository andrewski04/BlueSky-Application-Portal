import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';
import { FormDraftWithSectionsWithQuestionsWithOptions } from '$lib/server/application/formDraftArgs';
import { publishFormFromDraft } from '$lib/server/application/formService';
import { fail, redirect } from '@sveltejs/kit';

const log = new Logger('Admin form details page');

export const load = (async ({ locals, params }) => {
	requireRole(locals, 'ADMIN');

	const applicationForm = await prismaResult(
		prisma.applicationFormDraft.findUnique({
			where: {
				id: params.form_id
			},
			...FormDraftWithSectionsWithQuestionsWithOptions
		})
	);
	if (applicationForm.isErr()) {
		log.error('Error getting application form by ID', applicationForm.error);
		return { error: 'An error occurred while getting the form draft.' };
	}
	if (!applicationForm.value) {
		return { error: 'Application form not found' };
	}

	return {
		applicationForm: applicationForm.value
	};
}) satisfies PageServerLoad;

export const actions = {
	publishDraft: async ({ locals, params }) => {
		requireRole(locals, 'ADMIN');
		const publishRes = await publishFormFromDraft(params.form_id, { active: false });
		if (publishRes.isErr()) {
			return { success: false, error: publishRes.error.message };
		}
		return redirect(302, `/admin/published-forms/${publishRes.value.publishedId}`);
	},

	deleteDraft: async ({ locals, params }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return { success: false, error: 'Form ID is required' };
		}

		const result = await prismaResult(
			prisma.applicationFormDraft.delete({
				where: {
					id: params.form_id
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: 'An error occurred while deleting the form draft.' };
		}

		return redirect(302, '/admin/form-drafts');
	},
	updateDraft: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');
		const form = await request.formData();
		const name = form.get('name');
		const description = form.get('description');
		if (!name || typeof name !== 'string') {
			return fail(400, { success: false, error: 'Name is required.' });
		}
		if (description && typeof description !== 'string') {
			return fail(400, { success: false, error: 'Description must be a string.' });
		}
		const result = await prismaResult(
			prisma.applicationFormDraft.update({
				where: { id: params.form_id },
				data: { name: name.trim(), description: description?.trim() || null }
			})
		);
		if (result.isErr()) {
			return fail(500, { success: false, error: 'Error updating form draft.' });
		}
		return { success: true, message: 'Form draft updated successfully.' };
	}
} satisfies Actions;
