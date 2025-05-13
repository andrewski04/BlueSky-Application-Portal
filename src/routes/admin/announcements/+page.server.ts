import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import {
	getAllAnnouncements,
	createAnnouncement,
	deleteAnnouncement
} from '$lib/server/announcementService';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const announcements = await getAllAnnouncements();
	if (announcements.isErr()) {
		return { user, error: announcements.error };
	}

	return { user, announcements: announcements.value };
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ request, locals }) => {
		const { user } = requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const title = formData.get('title')?.toString();
		const message = formData.get('message')?.toString();

		if (!title || !message) {
			return { success: false, error: 'Title and message are required' };
		}

		const result = await createAnnouncement(title, message, user.id);
		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true, announcement: result.value };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const announcementId = formData.get('announcementId')?.toString();

		if (!announcementId) {
			return { success: false, error: 'Announcement ID is required' };
		}

		const result = await deleteAnnouncement(announcementId);
		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	}
};
