import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { getAllAnnouncements } from '$lib/server/announcementService';
import { getAllAvailableApplicationForms } from '$lib/server/application/formResponseService';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'USER');
	let applicationFormsError: string | null = null;
	let announcementsError: string | null = null;

	const applicationFormsResult = await getAllAvailableApplicationForms(user.id);
	if (applicationFormsResult.isErr()) {
		applicationFormsError = 'An unknown error occurred while fetching application forms.';
	}

	const announcementsResult = await getAllAnnouncements(5);
	if (announcementsResult.isErr()) {
		announcementsError = 'An unknown error occurred while fetching announcements.';
	}

	return {
		applicationFormsError,
		applicationForms: applicationFormsResult.isOk() ? applicationFormsResult.value : [],
		announcementsError,
		announcements: announcementsResult.isOk() ? announcementsResult.value : [],
		user
	};
}) satisfies PageServerLoad;
