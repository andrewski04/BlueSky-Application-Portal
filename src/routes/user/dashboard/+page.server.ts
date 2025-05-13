import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { getActivePublishedApplicationForms } from '$lib/server/application/applicationFormService';
import { getAllAnnouncements } from '$lib/server/announcementService';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'USER');

	const applicationFormsResult = await getActivePublishedApplicationForms();
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
