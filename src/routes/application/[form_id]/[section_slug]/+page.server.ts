import { requireAuth } from '$lib/server/auth/guard.js';
import {
	getSectionWithNavAndAnswers,
	saveApplicationSection
} from '$lib/server/application/formResponseService';
import { prisma, prismaResult } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const sectionSlug = params.section_slug;
	const userId = user.id;

	// find or create application response
	const applicationIdResult = await prismaResult(
		prisma.applicationResponse.upsert({
			where: {
				userId_formId: {
					userId,
					formId
				}
			},
			create: {
				userId,
				formId
			},
			update: {},
			select: {
				id: true
			}
		})
	);
	if (applicationIdResult.isErr()) {
		throw error(500, `Error fetching application id: ${applicationIdResult.error.message}`);
	}
	const applicationId = applicationIdResult.value;
	if (!applicationId) {
		throw error(404, 'Application not found');
	}

	// fetch existing section answers
	const sectionWithAnswersResult = await getSectionWithNavAndAnswers(applicationId.id, sectionSlug);
	if (sectionWithAnswersResult.isErr()) {
		throw error(
			500,
			`Error fetching application section answers: ${sectionWithAnswersResult.error.message}`
		);
	}

	return {
		sectionWithAnswers: sectionWithAnswersResult.value
	};
}

export const actions = {
	saveSection: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const formId = params.form_id;
		const sectionSlug = params.section_slug;

		const { user } = requireAuth(locals);
		const userId = user.id;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const responses: Record<string, any> = {};

		for (const [key, value] of formData.entries()) {
			// If the key exists, convert to array for questions with multiple answers, like checkboxes
			if (key in responses) {
				if (!Array.isArray(responses[key])) {
					responses[key] = [responses[key]];
				}
				responses[key].push(value);
			} else {
				responses[key] = value;
			}
		}
		const saveResult = await saveApplicationSection(userId, formId, sectionSlug, responses);

		if (saveResult.isErr()) {
			throw error(500, `Error saving application section: ${saveResult.error.message}`);
		}

		return { success: true };
	}
};
