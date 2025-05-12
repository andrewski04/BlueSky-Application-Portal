import { getFormSectionWithNavigationByFormIdAndSlug } from '$lib/server/application/applicationFormService';
import {
	getOrCreateApplicationIdByUserIdAndFormId,
	saveApplicationSection,
	getApplicationResponseSectionById
} from '$lib/server/application/applicationResponseService';
import { requireAuth } from '$lib/server/auth/guard.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const sectionSlug = params.section_slug;
	const userId = user.id;

	// fetch form section, with navigation slugs
	const sectionResult = await getFormSectionWithNavigationByFormIdAndSlug(formId, sectionSlug);
	if (sectionResult.isErr()) {
		throw error(500, `Error fetching form section: ${sectionResult.error.message}`);
	}
	if (!sectionResult.value) {
		throw error(404, 'Form section not found');
	}

	// fetch application id for user and form
	const applicationIdResult = await getOrCreateApplicationIdByUserIdAndFormId(userId, formId);
	if (applicationIdResult.isErr()) {
		throw error(500, `Error fetching application id: ${applicationIdResult.error.message}`);
	}
	const applicationId = applicationIdResult.value;
	if (!applicationId) {
		throw error(404, 'Application not found');
	}

	// fetch existing section answers
	const existingSectionAnswersResult = await getApplicationResponseSectionById(
		applicationId,
		sectionSlug
	);
	if (existingSectionAnswersResult.isErr()) {
		throw error(
			500,
			`Error fetching application section answers: ${existingSectionAnswersResult.error.message}`
		);
	}
	const existingSectionAnswers = existingSectionAnswersResult.value;

	return {
		section: sectionResult.value,
		existingAnswers: existingSectionAnswers
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
