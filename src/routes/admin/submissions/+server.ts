import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { prisma, prismaResult } from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';

// Type for application response with aggregate rating
type ApplicationResponseWithAggregate = Prisma.ApplicationResponseGetPayload<{
	include: {
		user: true;
		reviews: { select: { rating: true } };
		form: { include: { group: { select: { name: true } } } };
	};
}> & {
	aggregateRating: number;
	reviewCount: number;
};

const log = new Logger('submissions-api');

export const GET: RequestHandler = async ({ locals, url }) => {
	const { user } = requireRole(locals, 'ADMIN');

	// Get query parameters
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20; // Show 20 responses per page
	const search = url.searchParams.get('search') || '';
	const statusFilter = url.searchParams.get('status') || 'all';
	const groupFilter = url.searchParams.get('group') || 'all';
	const formFilter = url.searchParams.get('form') || 'all';
	const dateFromFilter = url.searchParams.get('dateFrom') || '';
	const dateToFilter = url.searchParams.get('dateTo') || '';
	const sortKey = url.searchParams.get('sort') || 'updatedAt';
	const sortDirection = url.searchParams.get('direction') || 'desc';
	const showAdminSubmissions = url.searchParams.get('showAdminSubmissions') === 'true';

	// Calculate offset
	const offset = (page - 1) * limit;

	// Build where clause for filtering
	const where: Prisma.ApplicationResponseWhereInput = {};

	if (search) {
		where.OR = [
			{
				user: {
					OR: [
						{ firstName: { contains: search, mode: 'insensitive' } },
						{ lastName: { contains: search, mode: 'insensitive' } },
						{ email: { contains: search, mode: 'insensitive' } }
					]
				}
			},
			{ id: { contains: search, mode: 'insensitive' } }
		];
	}

	if (statusFilter !== 'all') {
		where.status = statusFilter as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
	}

	if (groupFilter !== 'all') {
		where.form = {
			groupId: groupFilter
		};
	}

	if (formFilter !== 'all') {
		where.formId = formFilter;
	}

	if (dateFromFilter || dateToFilter) {
		const dateFilters: Prisma.ApplicationResponseWhereInput[] = [];

		if (dateFromFilter || dateToFilter) {
			const dateCondition: Prisma.DateTimeFilter = {};
			if (dateFromFilter) dateCondition.gte = new Date(dateFromFilter);
			if (dateToFilter) dateCondition.lte = new Date(dateToFilter + 'T23:59:59');

			dateFilters.push({ submittedAt: dateCondition });
			dateFilters.push({ updatedAt: dateCondition });
		}

		if (where.OR) {
			where.OR = [...where.OR, ...dateFilters];
		} else {
			where.OR = dateFilters;
		}
	}

	// Filter out admin submissions if showAdminSubmissions is false
	if (!showAdminSubmissions) {
		where.user = {
			role: { not: 'ADMIN' }
		};
	} else {
		where.user = {
			role: { in: ['ADMIN', 'USER'] }
		};
	}

	// Build orderBy clause for sorting
	let orderBy: Prisma.ApplicationResponseOrderByWithRelationInput = {};
	if (sortKey === 'user') {
		orderBy = {
			user: {
				lastName: sortDirection as 'asc' | 'desc'
			}
		};
	} else if (sortKey === 'form') {
		orderBy = {
			form: {
				name: sortDirection as 'asc' | 'desc'
			}
		};
	} else if (sortKey === 'group') {
		orderBy = {
			form: {
				group: {
					name: sortDirection as 'asc' | 'desc'
				}
			}
		};
	} else if (sortKey === 'rating') {
		// For rating sorting, we'll need to sort after fetching since it's calculated
		orderBy = { updatedAt: 'desc' }; // Default fallback
	} else {
		orderBy = { [sortKey]: sortDirection as 'asc' | 'desc' };
	}

	// Get total count for pagination
	const totalCountResult = await prismaResult(prisma.applicationResponse.count({ where }));

	if (totalCountResult.isErr()) {
		log.error('Error getting total count', totalCountResult.error);
		return json(
			{ error: 'An error occurred while loading the application responses.' },
			{ status: 500 }
		);
	}

	const totalCount = totalCountResult.value;
	const totalPages = Math.ceil(totalCount / limit);

	// Get paginated and filtered responses
	const applicationResponses = await prismaResult(
		prisma.applicationResponse.findMany({
			where,
			include: {
				user: true,
				reviews: {
					select: {
						rating: true
					}
				},
				form: {
					include: {
						group: {
							select: {
								name: true
							}
						}
					}
				}
			},
			orderBy,
			take: limit,
			skip: offset
		})
	);

	if (applicationResponses.isErr()) {
		log.error('Error getting application responses', applicationResponses.error);
		return json(
			{ error: 'An error occurred while loading the application responses.' },
			{ status: 500 }
		);
	}

	// Calculate aggregate review ratings for each response
	// aggregateRating: -1 = no reviews, 1-10 = average rating
	// reviewCount: number of reviews submitted
	const responsesWithAggregates: ApplicationResponseWithAggregate[] =
		applicationResponses.value.map((response) => {
			const reviews = response.reviews;
			let aggregateRating = -1; // Default to -1 if no reviews
			let reviewCount = 0;

			if (reviews && reviews.length > 0) {
				reviewCount = reviews.length;
				const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
				aggregateRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
			}

			return {
				...response,
				aggregateRating,
				reviewCount
			};
		});

	// Sort by rating if that's the selected sort key
	if (sortKey === 'rating') {
		responsesWithAggregates.sort((a, b) => {
			if (sortDirection === 'asc') {
				return a.aggregateRating - b.aggregateRating;
			} else {
				return b.aggregateRating - a.aggregateRating;
			}
		});
	}

	// Get available groups and forms for filters
	const [groupsResult, formsResult] = await Promise.all([
		prismaResult(
			prisma.applicationFormGroup.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' }
			})
		),
		prismaResult(
			prisma.applicationFormPublished.findMany({
				select: { id: true, name: true, adminName: true },
				orderBy: { name: 'asc' }
			})
		)
	]);

	return json({
		applicationResponses: responsesWithAggregates,
		user,
		availableGroups: groupsResult.isOk() ? groupsResult.value : [],
		availableForms: formsResult.isOk() ? formsResult.value : [],
		pagination: {
			currentPage: page,
			totalPages,
			totalCount,
			limit
		},
		filters: {
			search,
			status: statusFilter,
			group: groupFilter,
			form: formFilter,
			dateFrom: dateFromFilter,
			dateTo: dateToFilter,
			sort: sortKey,
			direction: sortDirection,
			showAdminSubmissions
		}
	});
};
