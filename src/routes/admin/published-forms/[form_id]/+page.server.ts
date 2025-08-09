import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';
import { FormPublishedWithSectionsWithQuestionsWithOptions } from '$lib/server/application/formDraftArgs';
import { fail, error } from '@sveltejs/kit';

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
		return error(500, 'An error occurred while loading the application form.');
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
		return error(500, 'An error occurred while loading the application form groups.');
	}

	return {
		user,
		applicationForm: applicationForm.value,
		groups: groupResult.value.map((g) => ({ ...g, formCount: g.forms.length }))
	};
}) satisfies PageServerLoad;

export const actions = {
	updatePublishedForm: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const description = formData.get('description');

		if (!name || typeof name !== 'string') {
			return fail(400, { success: false, error: 'Name is required.' });
		}
		if (description && typeof description !== 'string') {
			return fail(400, { success: false, error: 'Description must be a string.' });
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: params.form_id },
				data: { name: name.trim(), description: description?.toString().trim() || null }
			})
		);

		if (result.isErr()) {
			return fail(500, { success: false, error: 'Error updating published form.' });
		}

		return { success: true, message: 'Published form updated successfully.' };
	},
	updatePublishedFormActiveStatus: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const action = formData.get('action') as string | null;

		if (!action) {
			return fail(400, { success: false, error: 'Action is required' });
		}

		if (!params.form_id) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		if (action !== 'enable' && action !== 'disable') {
			return fail(400, { success: false, error: 'Invalid action' });
		}

		// For enable action, only update if form is not archived
		// For disable action, always update
		const whereClause =
			action === 'enable' ? { id: params.form_id, archived: false } : { id: params.form_id };

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: whereClause,
				data: {
					active: action === 'enable' ? true : false
				}
			})
		);

		if (result.isErr()) {
			if (action === 'enable') {
				return fail(400, { success: false, error: 'Cannot enable an archived form' });
			}
			return fail(500, { success: false, error: 'Failed to update form active status' });
		}

		return { success: true };
	},
	updatePublishedFormArchiveStatus: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const action = formData.get('action') as string | null;

		if (!action) {
			return fail(400, { success: false, error: 'Action is required' });
		}

		if (!params.form_id) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		if (action !== 'archive' && action !== 'unarchive') {
			return fail(400, { success: false, error: 'Invalid action' });
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: {
					id: params.form_id
				},
				data: {
					archived: action === 'archive' ? true : false,
					active: false
				}
			})
		);

		if (result.isErr()) {
			return fail(500, { success: false, error: 'Failed to update form archive status' });
		}

		return { success: true };
	},

	updateFormDateRange: async ({ locals, params, request }) => {
		requireRole(locals, 'ADMIN');

		if (!params.form_id) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		const formData = await request.formData();
		const openDateRaw = formData.get('openDate') as string | null;
		const closeDateRaw = formData.get('closeDate') as string | null;
		const openDatezoneOffset = formData.get('openDatetimezoneOffset') as string | null;
		const closeDatezoneOffset = formData.get('closeDatetimezoneOffset') as string | null;
		const noOpenDate = formData.get('noOpenDate') === 'true';
		const noCloseDate = formData.get('noCloseDate') === 'true';

		if (!openDatezoneOffset || !closeDatezoneOffset) {
			return fail(400, { success: false, error: 'Timezone offset is required' });
		}

		const openOffsetMinutes = parseInt(openDatezoneOffset, 10);
		const closeOffsetMinutes = parseInt(closeDatezoneOffset, 10);

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
		const openDate = noOpenDate ? null : localToUTC(openDateRaw, openOffsetMinutes);
		const closeDate = noCloseDate ? null : localToUTC(closeDateRaw, closeOffsetMinutes);

		// Validate that open date is before close date (only if both dates are set)
		if (openDate && closeDate && openDate >= closeDate) {
			return fail(400, { success: false, error: 'Open date must be before close date' });
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
			return fail(500, {
				success: false,
				error: 'An error occurred while updating the form date range.'
			});
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
			return fail(400, { success: false, error: 'Form ID is required' });
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
			return fail(500, {
				success: false,
				error: 'An error occurred while updating the form group.'
			});
		}

		return { success: true };
	},
	createGroup: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const name = formData.get('name') as string | null;
		const description = formData.get('description') as string | null;

		if (!name) {
			return fail(400, { success: false, error: 'Group name is required' });
		}

		const result = await prismaResult(
			prisma.applicationFormGroup.create({
				data: {
					name,
					description
				},
				select: {
					id: true,
					name: true,
					description: true
				}
			})
		);

		if (result.isErr()) {
			return fail(500, {
				success: false,
				error: 'An error occurred while creating the group.'
			});
		}

		return {
			success: true,
			group: result.value
		};
	},
	updateGroup: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const groupId = formData.get('groupId') as string | null;
		const name = formData.get('name') as string | null;
		const description = formData.get('description') as string | null;

		if (!groupId || !name) {
			return fail(400, { success: false, error: 'Group ID and name are required' });
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
			return fail(500, {
				success: false,
				error: 'An error occurred while updating the group.'
			});
		}

		return { success: true };
	},
	deleteGroup: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const groupId = formData.get('groupId') as string | null;

		if (!groupId) {
			return fail(400, { success: false, error: 'Group ID is required' });
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
			return fail(500, { success: false, error: 'Error getting group' });
		}

		if (!groupWithRelations.value) {
			return fail(404, { success: false, error: 'Group not found' });
		}

		if (groupWithRelations.value.submissions.length > 0) {
			return fail(400, { success: false, error: 'Cannot delete group that has submissions' });
		}

		// If group has forms, clear the group reference from those forms first
		if (groupWithRelations.value.forms.length > 0) {
			const formIds = groupWithRelations.value.forms.map((form) => form.id);

			const updateFormsResult = await prismaResult(
				prisma.applicationFormPublished.updateMany({
					where: { id: { in: formIds } },
					data: { groupId: null }
				})
			);

			if (updateFormsResult.isErr()) {
				return fail(500, { success: false, error: 'Error clearing group from forms' });
			}
		}

		const result = await prismaResult(
			prisma.applicationFormGroup.delete({
				where: { id: groupId }
			})
		);

		if (result.isErr()) {
			return fail(500, { success: false, error: 'Error deleting group' });
		}

		return { success: true };
	}
} satisfies Actions;
