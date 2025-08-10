import { requireAuth } from '$lib/server/auth/guard.js';
import {
	getApplicationFormWithAnswers,
	saveApplicationQuestion,
	submitApplication,
	checkApplicationReadOnly
} from '$lib/server/application/formResponseService';
import { getFormDraftPreview } from '$lib/server/application/formService';
import { prisma, prismaResult } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const userId = user.id;

	// admin draft form preview
	if (user.role === 'ADMIN' && params.view_type === 'preview') {
		const transformedForm = await getFormDraftPreview(formId);
		if (transformedForm.isErr()) {
			throw error(500, `Error fetching application form draft.`);
		}
		if (!transformedForm.value) {
			throw error(404, 'Application form not found');
		}

		return {
			applicationWithAnswers: transformedForm.value,
			isReadOnly: false,
			isAdminPreview: true,
			readOnlyMessage: 'Draft Form Preview',
			user
		};
	}

	if (params.view_type === 'form') {
		// check if form exists
		const form = await prismaResult(
			prisma.applicationFormPublished.findUnique({
				where: {
					id: formId
				}
			})
		);
		if (form.isErr() || !form.value) {
			throw error(404, `Application form not found.`);
		}

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
							openDate: true,
							active: true,
							archived: true
						}
					}
				}
			})
		);
		if (applicationResult.isErr()) {
			throw error(500, `Error fetching application ID.`);
		}
		const application = applicationResult.value;
		if (!application) {
			throw error(404, 'Application not found');
		}

		const applicationWithAnswersResult = await getApplicationFormWithAnswers(application.id);
		if (applicationWithAnswersResult.isErr()) {
			throw error(500, `Error fetching application form and answers.`);
		}

		const { isReadOnly, readOnlyMessage } = checkApplicationReadOnly(application);

		return {
			isReadOnly,
			readOnlyMessage,
			applicationWithAnswers: applicationWithAnswersResult.value,
			isAdminPreview: false,
			user
		};
	}

	throw error(404, 'Page not found');
}

export const actions = {
	saveQuestion: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const formId = params.form_id;

		const { user } = requireAuth(locals);
		const userId = user.id;

		// Prevent admin users from saving questions on draft forms
		if (user.role === 'ADMIN') {
			throw error(403, 'Admin users cannot save answers on draft forms.');
		}

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
			throw error(500, `Error fetching application.`);
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
		const rawValue = formData.get('value');
		const rawValueArray = formData.getAll('value[]');

		if (!questionVersionId) {
			throw error(400, 'Question version ID is required');
		}

		// Handle array values (checkbox questions)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let value: any = rawValue;

		// If we have array values, use those instead of the single value
		if (rawValueArray.length > 0) {
			value = rawValueArray;
		} else if (typeof rawValue === 'string' && rawValue.includes(',')) {
			// Handle comma-separated values for multiple choice questions
			value = rawValue.split(',').map((v) => v.trim());
		}

		const saveResult = await saveApplicationQuestion(userId, formId, questionVersionId, value);

		if (saveResult.isErr()) {
			throw error(500, `Error saving question.`);
		}

		return { success: true };
	},

	submitApplication: async ({ params, locals }) => {
		const { user } = requireAuth(locals);
		const userId = user.id;
		const formId = params.form_id;

		// Prevent admin users from submitting draft forms
		if (user.role === 'ADMIN') {
			throw error(403, 'Admin users cannot submit draft forms.');
		}

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
							groupId: true,
							active: true,
							archived: true
						}
					}
				}
			})
		);

		if (applicationResult.isErr()) {
			throw error(500, `Error fetching application.`);
		}

		const application = applicationResult.value;
		if (!application) {
			throw error(404, 'Application not found');
		}

		const { isReadOnly, readOnlyMessage } = checkApplicationReadOnly(application);
		if (isReadOnly) {
			throw error(403, readOnlyMessage);
		}

		const submitResult = await submitApplication(userId, formId, application.form.groupId);

		if (submitResult.isErr()) {
			throw error(500, `Error submitting application.`);
		}

		return redirect(302, '/user/dashboard');
	}
};
