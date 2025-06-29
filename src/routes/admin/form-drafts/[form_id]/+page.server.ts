import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';
import { FormDraftWithSectionsWithQuestionsWithOptions } from '$lib/server/application/FormDraftArgs';
import { publishFormFromDraft } from '$lib/server/application/formService';

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
		const publishRes = await publishFormFromDraft(params.form_id);
		if (publishRes.isErr()) {
			return { success: false, error: publishRes.error.message };
		}
		return { success: true };
	}

	/**deleteDraft: async ({ request, locals }) => {
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
