import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';
import { FormPublishedWithSectionsWithQuestionsWithOptions } from '$lib/server/application/formDraftArgs';

const log = new Logger('Admin published form details page');

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationForm = await prismaResult(
		prisma.applicationFormPublished.findUnique({
			where: {
				id: params.form_id
			},
			...FormPublishedWithSectionsWithQuestionsWithOptions
		})
	);

	if (applicationForm.isErr()) {
		log.error('Error getting application form by ID', applicationForm.error);
		return { error: applicationForm.error.message, user };
	}
	if (!applicationForm.value) {
		return { error: 'Application form not found', user };
	}

	const groupResult = await prismaResult(
		prisma.applicationFormGroup.findMany({
			select: {
				id: true,
				name: true,
				forms: { select: { id: true } }
			}
		})
	);
	if (groupResult.isErr()) {
		log.error('Error getting application form groups', groupResult.error);
		return { error: groupResult.error.message, user };
	}

	return {
		user,
		applicationForm: applicationForm.value,
		groups: groupResult.value.map((g) => ({ ...g, formCount: g.forms.length }))
	};
}) satisfies PageServerLoad;

export const actions = {
	disablePublishedForm: async ({ locals, params }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return { success: false, error: 'Form ID is required' };
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: {
					id: params.form_id
				},
				data: {
					active: false
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	},
	enablePublishedForm: async ({ locals, params }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return { success: false, error: 'Form ID is required' };
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: {
					id: params.form_id
				},
				data: {
					active: true
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	},
	updateFormDateRange: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return { success: false, error: 'Form ID is required' };
		}

		const formData = await request.formData();
		const openDateRaw = formData.get('openDate') as string | null;
		const closeDateRaw = formData.get('closeDate') as string | null;
		const timezoneOffset = formData.get('timezoneOffset') as string | null;

		if (!timezoneOffset) {
			return { success: false, error: 'Timezone offset is required' };
		}

		const offsetMinutes = parseInt(timezoneOffset, 10);

		function localToUTC(dateStr: string | null, offset: number): Date | null {
			if (!dateStr) return null;
			return new Date(new Date(dateStr).getTime() + offset * 60000);
		}

		const openDate = localToUTC(openDateRaw, offsetMinutes);
		const closeDate = localToUTC(closeDateRaw, offsetMinutes);

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: params.form_id },
				data: {
					openDate: openDate,
					closeDate: closeDate
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	}
} satisfies Actions;
