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
				openDate: {
					lte: new Date()
				},
				closeDate: {
					gte: new Date()
				}
			},
			include: {
				sections: {
					orderBy: {
						displayOrder: 'asc'
					}
				},
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

	const announcementsResult = await getAllAnnouncements();
	if (announcementsResult.isErr()) {
		return { error: announcementsResult.error.message, user };
	}

	return {
		applicationForms: applicationFormsResult.value,
		announcements: announcementsResult.value,
		user
	};
}) satisfies PageServerLoad;
