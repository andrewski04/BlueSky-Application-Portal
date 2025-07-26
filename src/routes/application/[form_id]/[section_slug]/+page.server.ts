import { requireAuth } from '$lib/server/auth/guard.js';
import {
	getSectionWithNavAndAnswers,
	saveApplicationSection,
	submitApplication
} from '$lib/server/application/formResponseService';
import { prisma, prismaResult } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { user } = requireAuth(locals);

	const formId = params.form_id;
	const sectionSlug = params.section_slug;
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
		throw error(500, `Error fetching application id: ${applicationResult.error.message}`);
	}
	const applicationId = applicationResult.value;
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

	let isReadOnly = applicationResult.value.status !== 'DRAFT';
	let readOnlyMessage = 'This form has been submitted and is no longer editable.';

	if (
		applicationResult.value.form.closeDate &&
		applicationResult.value.form.closeDate < new Date() &&
		applicationResult.value.status === 'DRAFT'
	) {
		isReadOnly = true;
		readOnlyMessage = 'This form is no longer available.';
	}

	if (applicationResult.value.form.openDate && applicationResult.value.form.openDate > new Date()) {
		throw error(403, 'This form is not yet available.');
	}

	return {
		isReadOnly,
		readOnlyMessage,
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

		// Check if form is closed
		if (application.form.closeDate && application.form.closeDate < new Date()) {
			throw error(403, 'This form is no longer available.');
		}

		// Check if form is not yet open
		if (application.form.openDate && application.form.openDate > new Date()) {
			throw error(403, 'This form is not yet available.');
		}

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

		// Check if form is closed
		if (application.form.closeDate && application.form.closeDate < new Date()) {
			throw error(403, 'This form is no longer available.');
		}

		// Check if form is not yet open
		if (application.form.openDate && application.form.openDate > new Date()) {
			throw error(403, 'This form is not yet available.');
		}

		const submitResult = await submitApplication(userId, formId);

		if (submitResult.isErr()) {
			throw error(500, `Error submitting application: ${submitResult.error.message}`);
		}

		return redirect(302, '/user/dashboard');
	}
};
