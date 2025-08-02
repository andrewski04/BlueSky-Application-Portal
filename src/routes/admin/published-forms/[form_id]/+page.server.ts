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
				description: true,
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
		const noOpenDate = formData.get('noOpenDate') === 'true';
		const noCloseDate = formData.get('noCloseDate') === 'true';

		if (!timezoneOffset) {
			return { success: false, error: 'Timezone offset is required' };
		}

		const offsetMinutes = parseInt(timezoneOffset, 10);

		function localToUTC(dateStr: string | null, offset: number): Date | null {
			if (!dateStr) return null;

			// The datetime-local input provides the date in the user's local timezone
			// We need to convert this to UTC for storage
			const localDate = new Date(dateStr);

			// Convert to UTC by adding the timezone offset
			const utcTime = localDate.getTime() + offset * 60000;

			return new Date(utcTime);
		}

		// Convert dates to UTC, or set to null if checkbox is checked
		const openDate = noOpenDate ? null : localToUTC(openDateRaw, offsetMinutes);
		const closeDate = noCloseDate ? null : localToUTC(closeDateRaw, offsetMinutes);

		// Validate that open date is before close date (only if both dates are set)
		if (openDate && closeDate && openDate >= closeDate) {
			return { success: false, error: 'Open date must be before close date' };
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: params.form_id },
				data: {
					openDate: openDate,
					closeDate: closeDate
				},
				select: {
					openDate: true,
					closeDate: true
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return {
			success: true,
			openDate: result.value.openDate,
			closeDate: result.value.closeDate
		};
	},
	updateFormGroup: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return { success: false, error: 'Form ID is required' };
		}

		const formData = await request.formData();
		const groupId = formData.get('group') as string | null;

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: params.form_id },
				data: {
					groupId: groupId || null
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	},
	createGroup: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const name = formData.get('name') as string | null;
		const description = formData.get('description') as string | null;

		if (!name) {
			return { success: false, error: 'Group name is required' };
		}

		const result = await prismaResult(
			prisma.applicationFormGroup.create({
				data: {
					name,
					description
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	},
	updateGroup: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const groupId = formData.get('groupId') as string | null;
		const name = formData.get('name') as string | null;
		const description = formData.get('description') as string | null;

		if (!groupId || !name) {
			return { success: false, error: 'Group ID and name are required' };
		}

		const result = await prismaResult(
			prisma.applicationFormGroup.update({
				where: { id: groupId },
				data: {
					name,
					description
				}
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	},
	deleteGroup: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const groupId = formData.get('groupId') as string | null;

		if (!groupId) {
			return { success: false, error: 'Group ID is required' };
		}

		// Check if group has any forms or submissions
		const groupWithRelations = await prismaResult(
			prisma.applicationFormGroup.findUnique({
				where: { id: groupId },
				include: {
					forms: { select: { id: true } },
					submissions: { select: { id: true } }
				}
			})
		);

		if (groupWithRelations.isErr()) {
			return { success: false, error: groupWithRelations.error.message };
		}

		if (!groupWithRelations.value) {
			return { success: false, error: 'Group not found' };
		}

		if (groupWithRelations.value.forms.length > 0) {
			return { success: false, error: 'Cannot delete group that has forms assigned to it' };
		}

		if (groupWithRelations.value.submissions.length > 0) {
			return { success: false, error: 'Cannot delete group that has submissions' };
		}

		const result = await prismaResult(
			prisma.applicationFormGroup.delete({
				where: { id: groupId }
			})
		);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	}
} satisfies Actions;
