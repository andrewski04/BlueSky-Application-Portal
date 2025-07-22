import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';
import { FormDraftWithSectionsWithQuestionsWithOptions } from '$lib/server/application/formDraftArgs';
import { publishFormFromDraft } from '$lib/server/application/formService';
import { redirect } from '@sveltejs/kit';

const log = new Logger('Admin form details page');

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

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
			return { success: false, error: result.error.message };
		}

		return redirect(302, '/admin/form-drafts');
	}
} satisfies Actions;
