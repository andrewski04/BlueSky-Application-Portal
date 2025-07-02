import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { prisma, prismaResult } from '$lib/server/prisma';
import { slugify } from '$lib/utils/slugify';

import { FormDraftWithSectionsWithQuestionsWithOptions } from '$lib/server/application/formDraftArgs';
import type { Actions } from '@sveltejs/kit';
const log = new Logger('Admin edit form page');

export const load = (async ({ locals, params }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const applicationForm = await prismaResult(
		prisma.applicationFormDraft.findUnique({
			where: {
				id: params.form_id
			},
			...FormDraftWithSectionsWithQuestionsWithOptions
		})
	);
	if (applicationForm.isErr()) {
		log.error('Error getting application form by ID', applicationForm.error);
		return { error: applicationForm.error.message, user };
	}
	if (!applicationForm.value) {
		return { error: 'Application form not found', user };
	}

	return {
		user,
		draftForm: applicationForm.value
	};
}) satisfies PageServerLoad;

export const actions = {
	createSection: async ({ request, params, locals }) => {
		requireRole(locals, 'ADMIN');

		const data = await request.formData();
		let name = data.get('name') as string;

		if (!name || name.trim() === '') {
			name = 'Untitled Section';
		}
		if (!params.form_id) {
			return { error: 'Form ID is required' };
		}

		const count = await prisma.formSectionDraft.count({ where: { formId: params.form_id } });

		const section = await prisma.formSectionDraft.create({
			data: { formId: params.form_id, name: name.trim(), slug: slugify(name), displayOrder: count },
			include: {
				questions: true
			}
		});

		prisma.applicationFormDraft.update({
			where: {
				id: params.form_id
			},
			data: {
				updatedAt: new Date()
			}
		});

		return { section, success: true };
	},
	deleteSection: async ({ request, locals, params }) => {
		requireRole(locals, 'ADMIN');

		const data = await request.formData();
		const sectionId = data.get('sectionId') as string;

		if (!sectionId) {
			return { error: 'Section ID is required' };
		}

		const section = await prisma.formSectionDraft.delete({
			where: {
				id: sectionId
			},
			include: {
				questions: true
			}
		});

		await prisma.applicationFormDraft.update({
			where: {
				id: params.form_id
			},
			data: {
				updatedAt: new Date()
			}
		});

		return { section, success: true };
	},
	updateSection: async ({ request, locals, params }) => {
		requireRole(locals, 'ADMIN');
		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const id = data.get('id') as string;

		if (!name || !description || !id) {
			return { error: 'Name, description, and ID are required' };
		}

		const updatedSection = await prisma.formSectionDraft.update({
			where: { id: id },
			data: { name, description }
		});
		await prisma.applicationFormDraft.update({
			where: {
				id: params.form_id
			},
			data: {
				updatedAt: new Date()
			}
		});

		return { section: updatedSection };
	}
} satisfies Actions;
