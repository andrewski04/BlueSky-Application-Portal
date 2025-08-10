import type { PageServerLoad, Actions } from './$types';
import { prisma, prismaResult } from '$lib/server/prisma';
import { requireRole } from '$lib/server/auth/guard';
import { fail, error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	requireRole(locals, 'ADMIN');

	const publishedForms = await prismaResult(
		prisma.applicationFormPublished.findMany({
			orderBy: { publishedAt: 'desc' },
			include: {
				responses: true
			}
		})
	);
	if (publishedForms.isErr()) {
		return error(500, 'Failed to fetch published forms');
	}
	return { publishedForms: publishedForms.value };
}) satisfies PageServerLoad;

export const actions = {
	updatePublishedFormActiveStatus: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const formId = formData.get('formId')?.toString();
		const active = formData.get('active')?.toString();

		if (!formId) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		const form = await prismaResult(
			prisma.applicationFormPublished.findUnique({
				where: { id: formId },
				select: { archived: true }
			})
		);
		if (form.isErr()) {
			return fail(500, { success: false, error: 'Error fetching form' });
		}
		if (form.value?.archived) {
			return fail(400, { success: false, error: 'Form is archived' });
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: formId },
				data: { active: active === 'true' }
			})
		);

		if (result.isErr()) {
			return fail(500, { success: false, error: 'Error updating form active status' });
		}

		return {
			success: true,
			message: `Form ${active === 'true' ? 'activated' : 'deactivated'} successfully`
		};
	},
	updatePublishedFormArchiveStatus: async ({ locals, request }) => {
		requireRole(locals, 'ADMIN');

		const formData = await request.formData();
		const formId = formData.get('formId')?.toString();
		const archived = formData.get('archived')?.toString();

		if (!formId) {
			return fail(400, { success: false, error: 'Form ID is required' });
		}

		const result = await prismaResult(
			prisma.applicationFormPublished.update({
				where: { id: formId },
				data: { archived: archived === 'true' }
			})
		);

		if (result.isErr()) {
			return fail(500, { success: false, error: 'Error updating form archive status' });
		}

		return {
			success: true,
			message: `Form ${archived === 'true' ? 'archived' : 'unarchived'} successfully`
		};
	}
} satisfies Actions;
