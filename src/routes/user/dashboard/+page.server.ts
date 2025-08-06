import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { getAllAnnouncements } from '$lib/server/announcementService';
import { prisma, prismaResult } from '$lib/server/prisma';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'USER');

	const applicationFormsResult = await prismaResult(
		prisma.applicationFormPublished.findMany({
			where: {
				active: true,
				OR: [
					// Forms with no date constraints
					{
						openDate: null,
						closeDate: null
					},
					// Forms with only open date that has passed
					{
						openDate: {
							lte: new Date()
						},
						closeDate: null
					},
					// Forms with only close date that hasn't passed
					{
						openDate: null,
						closeDate: {
							gte: new Date()
						}
					},
					// Forms with both dates that are currently valid
					{
						openDate: {
							lte: new Date()
						},
						closeDate: {
							gte: new Date()
						}
					}
				]
			},
			include: {
				responses: {
					where: {
						userId: user.id
					}
				}
			}
		})
	);
	if (applicationFormsResult.isErr()) {
		return { error: applicationFormsResult.error.message, user };
	}

	const announcementsResult = await getAllAnnouncements(5);
	if (announcementsResult.isErr()) {
		return { error: announcementsResult.error.message, user };
	}

	return {
		applicationForms: applicationFormsResult.value,
		announcements: announcementsResult.value,
		user
	};
}) satisfies PageServerLoad;
