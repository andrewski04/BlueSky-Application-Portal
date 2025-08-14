import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { upsertApplicationReview, aggregateApplicationReview } from './applicationReviewService';
import { prisma, prismaResult } from '../prisma';
import { ok, err, AppError } from '$lib/utils/error';

// Mock the prisma module
vi.mock('../prisma', () => ({
	prisma: {
		applicationReview: {
			upsert: vi.fn(),
			aggregate: vi.fn()
		}
	},
	prismaResult: vi.fn()
}));

describe('ApplicationReviewService', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockPrismaResult = vi.mocked(prismaResult);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('upsertApplicationReview', () => {
		it('should create new application review successfully', async () => {
			const mockReview = {
				id: 'review1',
				applicationId: 'app1',
				reviewerId: 'user1',
				rating: 5,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockPrismaResult.mockResolvedValue(ok(mockReview));

			const result = await upsertApplicationReview('app1', 5, 'user1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toEqual(mockReview);
			}
			expect(mockPrisma.applicationReview.upsert).toHaveBeenCalledWith({
				where: { applicationId_reviewerId: { applicationId: 'app1', reviewerId: 'user1' } },
				update: { rating: 5 },
				create: { applicationId: 'app1', reviewerId: 'user1', rating: 5 }
			});
		});

		it('should update existing application review successfully', async () => {
			const mockUpdatedReview = {
				id: 'review1',
				applicationId: 'app1',
				reviewerId: 'user1',
				rating: 4,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockPrismaResult.mockResolvedValue(ok(mockUpdatedReview));

			const result = await upsertApplicationReview('app1', 4, 'user1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toEqual(mockUpdatedReview);
			}
			expect(mockPrisma.applicationReview.upsert).toHaveBeenCalledWith({
				where: { applicationId_reviewerId: { applicationId: 'app1', reviewerId: 'user1' } },
				update: { rating: 4 },
				create: { applicationId: 'app1', reviewerId: 'user1', rating: 4 }
			});
		});

		it('should handle database errors gracefully', async () => {
			const dbError = new AppError('Database connection failed', 'ERR_DATABASE');
			mockPrismaResult.mockResolvedValue(err(dbError));

			const result = await upsertApplicationReview('app1', 5, 'user1');

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBe(dbError);
			}
		});

		it('should handle different rating values', async () => {
			const testCases = [
				{ rating: 1, expected: 1 },
				{ rating: 3, expected: 3 },
				{ rating: 5, expected: 5 },
				{ rating: 0, expected: 0 }
			];

			for (const testCase of testCases) {
				const mockReview = {
					id: 'review1',
					applicationId: 'app1',
					reviewerId: 'user1',
					rating: testCase.rating,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				mockPrismaResult.mockResolvedValue(ok(mockReview));

				const result = await upsertApplicationReview('app1', testCase.rating, 'user1');

				expect(result.isOk()).toBe(true);
				if (result.isOk()) {
					expect(result.unwrap().rating).toBe(testCase.expected);
				}
			}
		});

		it('should handle different application and reviewer IDs', async () => {
			const testCases = [
				{ applicationId: 'app1', reviewerId: 'user1' },
				{ applicationId: 'app2', reviewerId: 'user2' },
				{ applicationId: 'app3', reviewerId: 'user3' }
			];

			for (const testCase of testCases) {
				const mockReview = {
					id: 'review1',
					applicationId: testCase.applicationId,
					reviewerId: testCase.reviewerId,
					rating: 5,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				mockPrismaResult.mockResolvedValue(ok(mockReview));

				const result = await upsertApplicationReview(
					testCase.applicationId,
					5,
					testCase.reviewerId
				);

				expect(result.isOk()).toBe(true);
				if (result.isOk()) {
					expect(result.unwrap().applicationId).toBe(testCase.applicationId);
					expect(result.unwrap().reviewerId).toBe(testCase.reviewerId);
				}
			}
		});
	});

	describe('aggregateApplicationReview', () => {
		it('should return average rating successfully', async () => {
			const mockAggregateResult = {
				_avg: {
					rating: 4.5
				}
			};

			mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));

			const result = await aggregateApplicationReview('app1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toBe(4.5);
			}
			expect(mockPrisma.applicationReview.aggregate).toHaveBeenCalledWith({
				where: { applicationId: 'app1' },
				_avg: { rating: true }
			});
		});

		it('should return -1 when no reviews exist', async () => {
			const mockAggregateResult = {
				_avg: {
					rating: null
				}
			};

			mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));

			const result = await aggregateApplicationReview('app1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toBe(-1);
			}
		});

		it('should return -1 when average is undefined', async () => {
			const mockAggregateResult = {
				_avg: {
					rating: undefined
				}
			};

			mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));

			const result = await aggregateApplicationReview('app1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toBe(-1);
			}
		});

		it('should handle database errors gracefully', async () => {
			const dbError = new AppError('Database connection failed', 'ERR_DATABASE');
			mockPrismaResult.mockResolvedValue(err(dbError));

			const result = await aggregateApplicationReview('app1');

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBe(dbError);
			}
		});

		it('should handle different application IDs', async () => {
			const testCases = [
				{ applicationId: 'app1', expectedRating: 4.0 },
				{ applicationId: 'app2', expectedRating: 3.5 },
				{ applicationId: 'app3', expectedRating: 5.0 }
			];

			for (const testCase of testCases) {
				const mockAggregateResult = {
					_avg: {
						rating: testCase.expectedRating
					}
				};

				mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));

				const result = await aggregateApplicationReview(testCase.applicationId);

				expect(result.isOk()).toBe(true);
				if (result.isOk()) {
					expect(result.unwrap()).toBe(testCase.expectedRating);
				}
				expect(mockPrisma.applicationReview.aggregate).toHaveBeenCalledWith({
					where: { applicationId: testCase.applicationId },
					_avg: { rating: true }
				});
			}
		});

		it('should handle edge case ratings', async () => {
			const testCases = [
				{ rating: 0, expected: 0 },
				{ rating: 1, expected: 1 },
				{ rating: 5, expected: 5 },
				{ rating: null, expected: -1 },
				{ rating: undefined, expected: -1 }
			];

			for (const testCase of testCases) {
				const mockAggregateResult = {
					_avg: {
						rating: testCase.rating
					}
				};

				mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));

				const result = await aggregateApplicationReview('app1');

				expect(result.isOk()).toBe(true);
				if (result.isOk()) {
					expect(result.unwrap()).toBe(testCase.expected);
				}
			}
		});
	});

	describe('Integration scenarios', () => {
		it('should handle complete review workflow', async () => {
			// Create a review
			const mockReview = {
				id: 'review1',
				applicationId: 'app1',
				reviewerId: 'user1',
				rating: 5,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockPrismaResult.mockResolvedValue(ok(mockReview));

			const createResult = await upsertApplicationReview('app1', 5, 'user1');
			expect(createResult.isOk()).toBe(true);

			// Aggregate the review
			const mockAggregateResult = {
				_avg: {
					rating: 5
				}
			};

			mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));

			const aggregateResult = await aggregateApplicationReview('app1');
			expect(aggregateResult.isOk()).toBe(true);
			if (aggregateResult.isOk()) {
				expect(aggregateResult.unwrap()).toBe(5);
			}
		});

		it('should handle multiple reviewers for same application', async () => {
			// First reviewer
			const mockReview1 = {
				id: 'review1',
				applicationId: 'app1',
				reviewerId: 'user1',
				rating: 4,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockPrismaResult.mockResolvedValue(ok(mockReview1));
			const result1 = await upsertApplicationReview('app1', 4, 'user1');
			expect(result1.isOk()).toBe(true);

			// Second reviewer
			const mockReview2 = {
				id: 'review2',
				applicationId: 'app1',
				reviewerId: 'user2',
				rating: 5,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockPrismaResult.mockResolvedValue(ok(mockReview2));
			const result2 = await upsertApplicationReview('app1', 5, 'user2');
			expect(result2.isOk()).toBe(true);

			// Aggregate should show average
			const mockAggregateResult = {
				_avg: {
					rating: 4.5
				}
			};

			mockPrismaResult.mockResolvedValue(ok(mockAggregateResult));
			const aggregateResult = await aggregateApplicationReview('app1');
			expect(aggregateResult.isOk()).toBe(true);
			if (aggregateResult.isOk()) {
				expect(aggregateResult.unwrap()).toBe(4.5);
			}
		});
	});
});
