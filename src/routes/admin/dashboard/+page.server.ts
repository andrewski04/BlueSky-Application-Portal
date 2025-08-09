import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { getAllAnnouncements } from '$lib/server/announcementService';
import { Logger } from '$lib/utils/logger';

const log = new Logger('admin.dashboard');

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	// Get recent draft forms (last 5)
	const recentDraftFormsResult = await prismaResult(
		prisma.applicationFormDraft.findMany({
			orderBy: { updatedAt: 'desc' },
			take: 5,
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: { sections: true }
				}
			}
		})
	);

	if (recentDraftFormsResult.isErr()) {
		log.error('Error loading recent draft forms', recentDraftFormsResult.error);
		return {
			user,
			recentDraftForms: [],
			recentPublishedForms: [],
			recentSubmissions: [],
			recentAnnouncements: [],
			calendarEvents: [],
			submissionStats: [],
			totalDraftForms: 0,
			totalPublishedForms: 0,
			totalSubmissions: 0,
			totalAnnouncements: 0,
			error: 'Unable to load dashboard data'
		};
	}

	// Get recent published forms (last 5)
	const recentPublishedFormsResult = await prismaResult(
		prisma.applicationFormPublished.findMany({
			where: { archived: false },
			orderBy: { publishedAt: 'desc' },
			take: 5,
			select: {
				id: true,
				name: true,
				description: true,
				active: true,
				openDate: true,
				closeDate: true,
				publishedAt: true,
				_count: {
					select: { responses: true }
				}
			}
		})
	);

	if (recentPublishedFormsResult.isErr()) {
		log.error('Error loading recent published forms', recentPublishedFormsResult.error);
		return {
			user,
			recentDraftForms: recentDraftFormsResult.value,
			recentPublishedForms: [],
			recentSubmissions: [],
			recentAnnouncements: [],
			calendarEvents: [],
			submissionStats: [],
			totalDraftForms: 0,
			totalPublishedForms: 0,
			totalSubmissions: 0,
			totalAnnouncements: 0,
			error: 'Unable to load dashboard data'
		};
	}

	// Get recent submissions (last 10)
	const recentSubmissionsResult = await prismaResult(
		prisma.applicationResponse.findMany({
			orderBy: { updatedAt: 'desc' },
			take: 10,
			select: {
				id: true,
				status: true,
				submittedAt: true,
				createdAt: true,
				updatedAt: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true
					}
				},
				form: {
					select: {
						id: true,
						name: true
					}
				}
			}
		})
	);

	if (recentSubmissionsResult.isErr()) {
		log.error('Error loading recent submissions', recentSubmissionsResult.error);
		return {
			user,
			recentDraftForms: recentDraftFormsResult.value,
			recentPublishedForms: recentPublishedFormsResult.value,
			recentSubmissions: [],
			recentAnnouncements: [],
			calendarEvents: [],
			submissionStats: [],
			totalDraftForms: 0,
			totalPublishedForms: 0,
			totalSubmissions: 0,
			totalAnnouncements: 0,
			error: 'Unable to load dashboard data'
		};
	}

	// Get recent announcements (last 5)
	const announcementsResult = await getAllAnnouncements(5);
	const recentAnnouncements = announcementsResult.isOk() ? announcementsResult.value : [];

	// Get forms with open/close dates for current month
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

	const calendarEventsResult = await prismaResult(
		prisma.applicationFormPublished.findMany({
			where: {
				archived: false,
				OR: [
					{
						openDate: {
							gte: startOfMonth,
							lte: endOfMonth
						}
					},
					{
						closeDate: {
							gte: startOfMonth,
							lte: endOfMonth
						}
					}
				]
			},
			select: {
				id: true,
				name: true,
				openDate: true,
				closeDate: true
			}
		})
	);

	if (calendarEventsResult.isErr()) {
		log.error('Error loading calendar events', calendarEventsResult.error);
		return {
			user,
			recentDraftForms: recentDraftFormsResult.value,
			recentPublishedForms: recentPublishedFormsResult.value,
			recentSubmissions: recentSubmissionsResult.value,
			recentAnnouncements,
			calendarEvents: [],
			submissionStats: [],
			totalDraftForms: 0,
			totalPublishedForms: 0,
			totalSubmissions: 0,
			totalAnnouncements: 0,
			error: 'Unable to load dashboard data'
		};
	}

	// Get submission statistics
	const submissionStatsResult = await prismaResult(
		prisma.applicationResponse.groupBy({
			by: ['status'],
			_count: {
				status: true
			}
		})
	);

	if (submissionStatsResult.isErr()) {
		log.error('Error loading submission statistics', submissionStatsResult.error);
		return {
			user,
			recentDraftForms: recentDraftFormsResult.value,
			recentPublishedForms: recentPublishedFormsResult.value,
			recentSubmissions: recentSubmissionsResult.value,
			recentAnnouncements,
			calendarEvents: calendarEventsResult.value,
			submissionStats: [],
			totalDraftForms: 0,
			totalPublishedForms: 0,
			totalSubmissions: 0,
			totalAnnouncements: 0,
			error: 'Unable to load dashboard data'
		};
	}

	// Get total counts
	const totalDraftFormsResult = await prismaResult(prisma.applicationFormDraft.count());

	const totalPublishedFormsResult = await prismaResult(
		prisma.applicationFormPublished.count({
			where: { archived: false }
		})
	);

	const totalSubmissionsResult = await prismaResult(
		prisma.applicationResponse.count({
			where: {
				status: {
					not: 'DRAFT'
				}
			}
		})
	);

	const totalAnnouncementsResult = await prismaResult(prisma.announcement.count());

	// Handle any errors in count queries
	if (
		totalDraftFormsResult.isErr() ||
		totalPublishedFormsResult.isErr() ||
		totalSubmissionsResult.isErr() ||
		totalAnnouncementsResult.isErr()
	) {
		log.error('Error loading total counts', {
			draftForms: totalDraftFormsResult.isErr() ? totalDraftFormsResult.error : null,
			publishedForms: totalPublishedFormsResult.isErr() ? totalPublishedFormsResult.error : null,
			submissions: totalSubmissionsResult.isErr() ? totalSubmissionsResult.error : null,
			announcements: totalAnnouncementsResult.isErr() ? totalAnnouncementsResult.error : null
		});
	}

	return {
		user,
		recentDraftForms: recentDraftFormsResult.value,
		recentPublishedForms: recentPublishedFormsResult.value,
		recentSubmissions: recentSubmissionsResult.value,
		recentAnnouncements,
		calendarEvents: calendarEventsResult.value,
		submissionStats: submissionStatsResult.value,
		totalDraftForms: totalDraftFormsResult.isOk() ? totalDraftFormsResult.value : 0,
		totalPublishedForms: totalPublishedFormsResult.isOk() ? totalPublishedFormsResult.value : 0,
		totalSubmissions: totalSubmissionsResult.isOk() ? totalSubmissionsResult.value : 0,
		totalAnnouncements: totalAnnouncementsResult.isOk() ? totalAnnouncementsResult.value : 0
	};
}) satisfies PageServerLoad;
