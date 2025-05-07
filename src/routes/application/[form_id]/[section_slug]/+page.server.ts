import { getFormSectionByFormIdAndSlug } from '$lib/server/application/applicationFormService';
import {
	getApplicationByUserIdAndFormId,
	saveApplicationSection
} from '$lib/server/application/applicationResponseService';
import { requireAuth } from '$lib/server/auth/guard.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const sectionSlug = params.section_slug;
	const userId = user.id;

	const sectionResult = await getFormSectionByFormIdAndSlug(formId, sectionSlug);

	if (sectionResult.isErr()) {
		throw error(500, `Error fetching form section: ${sectionResult.error.message}`);
	}

	if (!sectionResult.value) {
		throw error(404, 'Form section not found');
	}

	const applicationResponse = await getApplicationByUserIdAndFormId(userId, formId);

	// Filter and select necessary fields from answers for the current section's questions
	const sectionQuestionIds = sectionResult.value.questions.map((q) => q.id);
	const existingSectionAnswers =
		applicationResponse?.answers
			.filter((answer) => sectionQuestionIds.includes(answer.questionId))
			.map((answer) => ({
				id: answer.id,
				applicationId: answer.applicationId,
				questionId: answer.questionId,
				valueText: answer.valueText,
				valueNumber: answer.valueNumber,
				valueBool: answer.valueBool,
				valueDate: answer.valueDate,
				fileUploadId: answer.fileUploadId,
				selectedOptions: answer.selectedOptions.map((opt) => ({
					answerId: opt.answerId,
					optionId: opt.optionId
				}))
			})) || [];

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
