import { Logger } from '$lib/utils/logger';
import { prisma } from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { type Result, err, ok, AppError } from '$lib/utils/error';
const log = new Logger('announcementService');

type AnnouncementWithUser = Prisma.AnnouncementGetPayload<{
	include: {
		user: true;
	};
}>;

/**
 * Retrieves all announcements from the database.
 *
 * @param amount - The amount of announcements to retrieve, sorted by createdAt descending.
 *
 * @returns A promise resolving to a Result containing an array of Announcement objects,
 *          or an error if the retrieval fails.
 */
export function getAllAnnouncements(amount: number = -1): Promise<Result<AnnouncementWithUser[]>> {
	return prisma.announcement
		.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			take: amount === -1 ? undefined : amount,
			include: {
				user: true
			}
		})
		.then((announcements) => ok(announcements))
		.catch((error) => {
			log.error('Error getting all announcements', error);
			return err(new AppError('Error getting all announcements', 'ERR_GET_ALL_ANNOUNCEMENTS'));
		});
}

/**
 * Creates a new announcement in the database.
 *
 * @param title - The title of the announcement.
 * @param message - The message of the announcement.
 * @param userId - The ID of the user creating the announcement.
 * @returns A promise resolving to a Result containing the ID of the created announcement,
 *          or an error if the creation fails.
 */
export function createAnnouncement(
	title: string,
	message: string,
	userId: string
): Promise<Result<AnnouncementWithUser>> {
	return prisma.announcement
		.create({
			data: {
				title,
				message,
				userId
			},
			include: {
				user: true
			}
		})
		.then((announcement) => ok(announcement))
		.catch((error) => {
			log.error('Error creating announcement', error);
			return err(new AppError('Error creating announcement', 'ERR_CREATE_ANNOUNCEMENT'));
		});
}

/**
 * Deletes an announcement from the database by its ID.
 *
 * @param announcementId - The unique identifier of the announcement to delete.
 * @returns A promise resolving to a Result containing the ID of the deleted announcement,
 *          or an error if the deletion fails.
 */
export function deleteAnnouncement(
	announcementId: string
): Promise<Result<{ announcementId: string }>> {
	return prisma.announcement
		.delete({
			where: {
				id: announcementId
			}
		})
		.then((announcement) => ok({ announcementId: announcement.id }))
		.catch((error) => {
			log.error('Error deleting announcement', error);
			return err(new AppError('Error deleting announcement', 'ERR_DELETE_ANNOUNCEMENT'));
		});
}
