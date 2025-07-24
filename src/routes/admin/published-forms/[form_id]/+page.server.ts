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
		const timezoneOffset = parseInt(formData.get('timezone') as string) || 0;

		function localToISOString(
			dateStr: string | null,
			timezoneOffsetMinutes: number
		): string | null {
			if (!dateStr) return null;

			// Parse the local datetime string into components
			const [datePart, timePart] = dateStr.split('T');
			if (!datePart || !timePart) return null;

			const [year, month, day] = datePart.split('-').map(Number);
			const [hour, minute] = timePart.split(':').map(Number);

			// Construct a Date object using local time
			const localDate = new Date(year, month - 1, day, hour, minute);

			// Convert to UTC by subtracting the local timezone offset
			const utcDate = new Date(localDate.getTime() - timezoneOffsetMinutes * 60 * 1000);

			// Return ISO string (with Z suffix for UTC)
			return utcDate.toISOString();
		}

		const openDateUTC = localToISOString(openDateRaw, timezoneOffset);
		const closeDateUTC = localToISOString(closeDateRaw, timezoneOffset);

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: params.form_id },
				data: {
					openDate: openDateUTC,
					closeDate: closeDateUTC
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	}
} satisfies Actions;
