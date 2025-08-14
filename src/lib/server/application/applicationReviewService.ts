import { prismaResult, prisma } from '$lib/server/prisma';
import { type Result, ok, err } from '$lib/utils/error';
import type { ApplicationReview } from '@prisma/client';

export async function upsertApplicationReview(
	applicationId: string,
	rating: number,
	reviewerId: string
): Promise<Result<ApplicationReview>> {
	const result = await prismaResult(
		prisma.applicationReview.upsert({
			where: { applicationId_reviewerId: { applicationId, reviewerId } },
			update: { rating },
			create: { applicationId, reviewerId, rating }
		})
	);
	return result;
}

export async function aggregateApplicationReview(applicationId: string): Promise<Result<number>> {
	const review = await prismaResult(
		prisma.applicationReview.aggregate({
			where: { applicationId },
			_avg: { rating: true }
		})
	);

	if (review.isErr()) {
		return err(review.error);
	}

	return ok(review.value._avg.rating ?? -1);
}
