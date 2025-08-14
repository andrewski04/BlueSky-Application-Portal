import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { getApplicationFormWithAnswers } from '$lib/server/application/formResponseService';
import { prismaResult, prisma } from '$lib/server/prisma';
import { checkApplicationReadOnly } from '$lib/server/application/formResponseService';
import {
	aggregateApplicationReview,
	upsertApplicationReview
} from '$lib/server/application/applicationReviewService';
import { fail, error } from '@sveltejs/kit';

const log = new Logger('Admin submissions page');

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const formResponseResult = await prismaResult(
		prisma.applicationResponse.findUnique({
			where: { id: params.submission_id },
			include: {
				form: { select: { id: true } },
				user: true
			}
		})
	);

	if (formResponseResult.isErr() || !formResponseResult.value) {
		return error(404, 'Application response not found');
	}

	const formWithAnswersResult = await getApplicationFormWithAnswers(
		params.submission_id,
		formResponseResult.value.form.id
	);

	if (formWithAnswersResult.isErr()) {
		log.error('Error getting application response by ID', formWithAnswersResult.error);
		return error(500, 'An error occurred while loading the application response.');
	}
	if (!formWithAnswersResult.value) {
		return error(404, 'Application response not found');
	}

	const formWithAnswers = {
		...formWithAnswersResult.value,
		...formResponseResult.value
	};

	const reviewResult = await aggregateApplicationReview(formResponseResult.value.id);
	if (reviewResult.isErr()) {
		log.error('Error aggregating application review', reviewResult.error);
		return error(500, 'An error occurred while loading the application review.');
	}
	const reviewAggregate = reviewResult.value ?? -1;

	const { isReadOnly } = checkApplicationReadOnly({
		status: formResponseResult.value.status,
		form: formWithAnswersResult.value
	});

	const commentsResult = await prismaResult(
		prisma.applicationComment.findMany({
			where: { applicationId: params.submission_id },
			include: { reviewer: true }
		})
	);
	if (commentsResult.isErr()) {
		log.error('Error getting application comments', commentsResult.error);
		return error(500, 'An error occurred while loading the application comments.');
	}
	const comments = commentsResult.value;

	const reviewsResult = await prismaResult(
		prisma.applicationReview.findMany({
			where: { applicationId: params.submission_id },
			include: { reviewer: true }
		})
	);
	if (reviewsResult.isErr()) {
		log.error('Error getting application reviews', reviewsResult.error);
		return error(500, 'An error occurred while loading the application reviews.');
	}
	const reviews = reviewsResult.value;

	return {
		reviews,
		user,
		formWithAnswers,
		isReadOnly,
		reviewAggregate,
		comments
	};
}) satisfies PageServerLoad;

export const actions = {
	updateStatus: async ({ locals, request, params }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const status = formData.get('status') as string;

		if (
			!status ||
			!['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status)
		) {
			return fail(400, { success: false, error: 'Invalid status' });
		}

		const updateResult = await prismaResult(
			prisma.applicationResponse.update({
				where: { id: params.submission_id },
				data: {
					status: status as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED',
					submittedAt: status === 'SUBMITTED' ? new Date() : undefined
				}
			})
		);

		if (updateResult.isErr()) {
			return fail(500, { success: false, error: 'Failed to update status' });
		}

		return { success: true, status: updateResult.value.status };
	},
	review: async ({ locals, request, params }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const rating = Number(formData.get('rating'));

		if (isNaN(rating)) {
			return fail(400, { success: false, error: 'Rating must be a number' });
		}
		if (rating < 1 || rating > 10) {
			return fail(400, { success: false, error: 'Rating must be between 1 and 10' });
		}

		const reviewResult = await upsertApplicationReview(
			params.submission_id,
			rating,
			locals.user.id
		);

		if (reviewResult.isErr()) {
			return fail(500, { success: false, error: 'Failed to submit review' });
		}

		const reviewAggregateResult = await aggregateApplicationReview(params.submission_id);
		if (reviewAggregateResult.isErr()) {
			return fail(500, { success: false, error: 'Failed to aggregate review' });
		}

		return { success: true, reviewAggregate: reviewAggregateResult.value };
	},
	addComment: async ({ locals, request, params }) => {
		const { user } = requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const comment = formData.get('comment') as string;
		const reviewerId = user.id;

		if (!comment || comment.trim() === '') {
			return fail(400, { success: false, error: 'Comment is required' });
		}

		const commentResult = await prismaResult(
			prisma.applicationComment.create({
				data: {
					applicationId: params.submission_id,
					comment,
					reviewerId
				},
				include: { reviewer: true }
			})
		);

		if (commentResult.isErr()) {
			return fail(500, { success: false, error: 'Failed to add comment' });
		}

		return { success: true, comment: commentResult.value };
	},
	deleteComment: async ({ locals, request }) => {
		const { user } = requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;

		if (!commentId || commentId.trim() === '') {
			return fail(400, { success: false, error: 'Comment ID is required' });
		}

		const commentResult = await prismaResult(
			prisma.applicationComment.delete({
				where: { id: commentId, reviewerId: user.id }
			})
		);

		if (commentResult.isErr()) {
			return fail(500, { success: false, error: 'Failed to delete comment' });
		}

		return { success: true, comment: commentResult.value };
	}
} satisfies Actions;
