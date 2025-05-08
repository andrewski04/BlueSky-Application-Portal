import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { redirect } from '@sveltejs/kit';
import { getActivePublishedApplicationForms } from '$lib/server/application/applicationFormService';

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'USER');

	if (!user.isSetup) {
		throw redirect(303, '/user/account-setup');
	}

	const applicationFormsResult = await getActivePublishedApplicationForms();
	if (applicationFormsResult.isErr()) {
		return { error: applicationFormsResult.error.message, user };
	}

	return {
		applicationForms: applicationFormsResult.value,
		user
	};
}) satisfies PageServerLoad;
