import { requireAuth } from '$lib/server/auth/guard.js';
import {
	getApplicationFormWithAnswers,
	saveApplicationSection,
	saveApplicationQuestion,
	submitApplication
} from '$lib/server/application/formResponseService';
import { prisma, prismaResult } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const userId = user.id;

	// find or create application response
	const applicationResult = await prismaResult(
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
				id: true,
				status: true,
				form: {
					select: {
						closeDate: true,
						openDate: true
					}
				}
			}
		})
	);
	if (applicationResult.isErr()) {
		throw error(500, `Error fetching application ID.`);
	}
	const applicationId = applicationResult.value;
	if (!applicationId) {
		throw error(404, 'Application not found');
	}

	// fetch existing section answers
	const applicationWithAnswersResult = await getApplicationFormWithAnswers(applicationId.id);
	if (applicationWithAnswersResult.isErr()) {
		throw error(500, `Error fetching application form and answers.`);
	}

	let isReadOnly = applicationResult.value.status !== 'DRAFT';
	let readOnlyMessage = 'This form has been submitted and is no longer editable.';

	// Check if form is closed (only if closeDate is set)
	if (
		applicationResult.value.form.closeDate &&
		applicationResult.value.form.closeDate < new Date() &&
		applicationResult.value.status === 'DRAFT'
	) {
		isReadOnly = true;
		readOnlyMessage = 'This form is no longer available.';
	}

	// Check if form is not yet open (only if openDate is set)
	if (applicationResult.value.form.openDate && applicationResult.value.form.openDate > new Date()) {
		throw error(403, 'This form is not yet available.');
	}

	return {
		isReadOnly,
		readOnlyMessage,
		applicationWithAnswers: applicationWithAnswersResult.value
	};
}

export const actions = {
	saveQuestion: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const formId = params.form_id;

		const { user } = requireAuth(locals);
		const userId = user.id;

		// Validate form availability and submission status
		const applicationResult = await prismaResult(
			prisma.applicationResponse.findUnique({
				where: {
					userId_formId: {
						userId,
						formId
					}
				},
				select: {
					id: true,
					status: true,
					form: {
						select: {
							closeDate: true,
							openDate: true
						}
					}
				}
			})
		);

		if (applicationResult.isErr()) {
			throw error(500, `Error fetching application: ${applicationResult.error.message}`);
		}

		const application = applicationResult.value;
		if (!application) {
			throw error(404, 'Application not found');
		}

		// Check if form is already submitted
		if (application.status !== 'DRAFT') {
			throw error(403, 'This form has been submitted and is no longer editable.');
		}

		// Check if form is closed (only if closeDate is set)
		if (application.form.closeDate && application.form.closeDate < new Date()) {
			throw error(403, 'This form is no longer available.');
		}

		// Check if form is not yet open (only if openDate is set)
		if (application.form.openDate && application.form.openDate > new Date()) {
			throw error(403, 'This form is not yet available.');
		}

		const questionVersionId = formData.get('questionVersionId') as string;
		const value = formData.get('value');

		if (!questionVersionId) {
			throw error(400, 'Question version ID is required');
		}

		const saveResult = await saveApplicationQuestion(userId, formId, questionVersionId, value);

		if (saveResult.isErr()) {
			throw error(500, `Error saving question: ${saveResult.error.message}`);
		}

		return { success: true };
	},

	saveSection: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const formId = params.form_id;

		const { user } = requireAuth(locals);
		const userId = user.id;

		// Validate form availability and submission status
		const applicationResult = await prismaResult(
			prisma.applicationResponse.findUnique({
				where: {
					userId_formId: {
						userId,
						formId
					}
				},
				select: {
					id: true,
					status: true,
					form: {
						select: {
							closeDate: true,
							openDate: true
						}
					}
				}
			})
		);

		if (applicationResult.isErr()) {
			throw error(500, `Error fetching application: ${applicationResult.error.message}`);
		}

		const application = applicationResult.value;
		if (!application) {
			throw error(404, 'Application not found');
		}

		// Check if form is already submitted
		if (application.status !== 'DRAFT') {
			throw error(403, 'This form has been submitted and is no longer editable.');
		}

		// Check if form is closed (only if closeDate is set)
		if (application.form.closeDate && application.form.closeDate < new Date()) {
			throw error(403, 'This form is no longer available.');
		}

		// Check if form is not yet open (only if openDate is set)
		if (application.form.openDate && application.form.openDate > new Date()) {
			throw error(403, 'This form is not yet available.');
		}

		// Extract section slug from form data
		const sectionSlug = formData.get('sectionSlug') as string;
		if (!sectionSlug) {
			throw error(400, 'Section slug is required');
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const responses: Record<string, any> = {};

		for (const [key, value] of formData.entries()) {
			// Skip sectionSlug as it's not a question response
			if (key === 'sectionSlug') continue;

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
	},
	submitApplication: async ({ params, locals }) => {
		const { user } = requireAuth(locals);
		const userId = user.id;
		const formId = params.form_id;

		// Validate form availability and submission status
		const applicationResult = await prismaResult(
			prisma.applicationResponse.findUnique({
				where: {
					userId_formId: {
						userId,
						formId
					}
				},
				select: {
					id: true,
					status: true,
					form: {
						select: {
							closeDate: true,
							openDate: true,
							groupId: true
						}
					}
				}
			})
		);

		if (applicationResult.isErr()) {
			throw error(500, `Error fetching application: ${applicationResult.error.message}`);
		}

		const application = applicationResult.value;
		if (!application) {
			throw error(404, 'Application not found');
		}

		// Check if form is already submitted
		if (application.status !== 'DRAFT') {
			throw error(403, 'This form has been submitted and is no longer editable.');
		}

		// Check if form is closed (only if closeDate is set)
		if (application.form.closeDate && application.form.closeDate < new Date()) {
			throw error(403, 'This form is no longer available.');
		}

		// Check if form is not yet open (only if openDate is set)
		if (application.form.openDate && application.form.openDate > new Date()) {
			throw error(403, 'This form is not yet available.');
		}

		const submitResult = await submitApplication(userId, formId, application.form.groupId);

		if (submitResult.isErr()) {
			throw error(500, `Error submitting application: ${submitResult.error.message}`);
		}

		return redirect(302, '/user/dashboard');
	}
};
