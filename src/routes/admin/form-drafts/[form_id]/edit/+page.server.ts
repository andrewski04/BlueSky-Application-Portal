import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { prisma, prismaResult } from '$lib/server/prisma';
import { slugify } from '$lib/utils/slugify';
import type { QuestionType } from '@prisma/client';
import { fail } from '@sveltejs/kit';

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
			return fail(400, { error: 'Form ID is required' });
		}

		const count = await prismaResult(
			prisma.formSectionDraft.count({ where: { formId: params.form_id } })
		);
		if (count.isErr()) {
			return fail(500, { error: 'Error getting section count' });
		}

		// Check for duplicate name or slug in the same form
		const slug = slugify(name);
		const existingSection = await prismaResult(
			prisma.formSectionDraft.findFirst({
				where: {
					formId: params.form_id,
					OR: [{ name: name.trim() }, { slug: slug }]
				}
			})
		);
		if (existingSection.isErr()) {
			return fail(500, { error: 'Error getting existing section' });
		}

		if (existingSection.value) {
			return fail(400, {
				error:
					existingSection.value.name === name.trim()
						? `A section with the name "${name.trim()}" already exists in this form`
						: `A section with a similar name already exists in this form`
			});
		}

		const section = await prismaResult(
			prisma.formSectionDraft.create({
				data: {
					formId: params.form_id,
					name: name.trim(),
					slug: slugify(name),
					description: '',
					displayOrder: count.value,
					colorScheme: 'BLUE'
				},
				include: {
					questions: true
				}
			})
		);
		if (section.isErr()) {
			return fail(500, { error: 'Error creating section' });
		}

		await prismaResult(
			prisma.applicationFormDraft.update({
				where: {
					id: params.form_id
				},
				data: {
					updatedAt: new Date()
				}
			})
		);

		return { type: 'success', section: section.value };
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

		return { type: 'success', data: { section } };
	},
	updateSection: async ({ request, locals, params }) => {
		requireRole(locals, 'ADMIN');
		const data = await request.formData();
		const sectionJson = data.get('section') as string;

		if (!sectionJson) {
			return fail(400, { error: 'Section data is required' });
		}

		try {
			const section = JSON.parse(sectionJson);

			if (!section.id) {
				return fail(400, { error: 'Section ID is required' });
			}

			if (!section.name) {
				return fail(400, { error: 'Section name is required' });
			}

			if (
				section.displayOrder === undefined ||
				section.displayOrder === null ||
				typeof section.displayOrder !== 'number'
			) {
				return fail(400, { error: 'Section display order is required' });
			}

			// Always update the slug to match the new name
			section.slug = slugify(section.name);

			// Check for duplicate name or slug in the same form
			const existingSection = await prisma.formSectionDraft.findFirst({
				where: {
					formId: params.form_id,
					id: { not: section.id }, // Exclude current section
					OR: [{ name: section.name }, { slug: section.slug }]
				}
			});

			if (existingSection) {
				return fail(400, {
					error:
						existingSection.name === section.name
							? `A section with the name "${section.name}" already exists in this form`
							: `A section with a similar name already exists in this form`
				});
			}

			// Update the section with all its data
			const updatedSection = await prisma.formSectionDraft.update({
				where: { id: section.id },
				data: {
					name: section.name,
					description: section.description || '',
					slug: section.slug,
					displayOrder: section.displayOrder,
					colorScheme: section.colorScheme || 'BLUE'
				},
				include: {
					questions: {
						include: {
							questionDraft: { include: { options: true } },
							questionVersion: { include: { options: true } }
						}
					}
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

			return { type: 'success', section: updatedSection };
		} catch (error) {
			log.error('Error updating section', error);
			return fail(500, { error: 'Failed to update section' });
		}
	},
	createQuestion: async ({ request, locals, params }) => {
		requireRole(locals, 'ADMIN');
		const data = await request.formData();

		const sectionId = data.get('sectionId') as string;
		const type = data.get('type') as string;
		const prompt = data.get('prompt') as string;
		const required = data.get('required') === 'true';
		const slug = data.get('slug') as string;

		if (!sectionId || !type || !prompt || !slug) {
			return { type: 'error', error: 'Missing required fields' };
		}

		try {
			// Get the current display order for the section
			const currentOrder = await prisma.questionLinkDraft.count({
				where: { sectionId }
			});

			// Create the question draft
			const questionDraft = await prisma.questionDraft.create({
				data: {
					prompt,
					type: type as QuestionType,
					slug,
					minLength: data.get('minLength') ? parseInt(data.get('minLength') as string) : null,
					maxLength: data.get('maxLength') ? parseInt(data.get('maxLength') as string) : null,
					minValue: data.get('minValue') ? parseFloat(data.get('minValue') as string) : null,
					maxValue: data.get('maxValue') ? parseFloat(data.get('maxValue') as string) : null,
					minDate: data.get('minDate') ? new Date(data.get('minDate') as string) : null,
					maxDate: data.get('maxDate') ? new Date(data.get('maxDate') as string) : null,
					acceptedTypes: (data.get('acceptedTypes') as string) || null,
					maxFileSizeBytes: data.get('maxFileSizeBytes')
						? parseInt(data.get('maxFileSizeBytes') as string) * 1024 * 1024
						: null // Convert MB to bytes
				}
			});

			// Create options if provided
			const optionsJson = data.get('options') as string;
			if (optionsJson) {
				const options = JSON.parse(optionsJson) as string[];
				await prisma.questionOptionDraft.createMany({
					data: options.map((text, index) => ({
						questionId: questionDraft.id,
						text: text.trim(),
						displayOrder: index,
						slug: slugify(text.trim())
					}))
				});
			}

			// Create the question link
			const questionLink = await prisma.questionLinkDraft.create({
				data: {
					sectionId,
					questionDraftId: questionDraft.id,
					displayOrder: currentOrder,
					required
				},
				include: {
					questionDraft: {
						include: {
							options: {
								orderBy: {
									displayOrder: 'asc'
								}
							}
						}
					},
					questionVersion: {
						include: {
							options: {
								orderBy: {
									displayOrder: 'asc'
								}
							}
						}
					}
				}
			});

			// Update the form's updatedAt timestamp
			await prisma.applicationFormDraft.update({
				where: {
					id: params.form_id
				},
				data: {
					updatedAt: new Date()
				}
			});

			return { type: 'success', question: questionLink };
		} catch (error) {
			log.error('Error creating question', error);
			return { type: 'error', error: 'Failed to create question' };
		}
	},
	updateQuestion: async ({ request, locals, params }) => {
		requireRole(locals, 'ADMIN');
		const data = await request.formData();

		const questionId = data.get('questionId') as string;
		const type = data.get('type') as string;
		const prompt = data.get('prompt') as string;
		const required = data.get('required') === 'true';
		const slug = data.get('slug') as string;

		if (!questionId || !type || !prompt || !slug) {
			return { type: 'error', error: 'Missing required fields' };
		}

		try {
			// Update the question draft
			await prisma.questionDraft.update({
				where: { id: questionId },
				data: {
					prompt,
					type: type as QuestionType,
					slug,
					minLength: data.get('minLength') ? parseInt(data.get('minLength') as string) : null,
					maxLength: data.get('maxLength') ? parseInt(data.get('maxLength') as string) : null,
					minValue: data.get('minValue') ? parseFloat(data.get('minValue') as string) : null,
					maxValue: data.get('maxValue') ? parseFloat(data.get('maxValue') as string) : null,
					minDate: data.get('minDate') ? new Date(data.get('minDate') as string) : null,
					maxDate: data.get('maxDate') ? new Date(data.get('maxDate') as string) : null,
					acceptedTypes: (data.get('acceptedTypes') as string) || null,
					maxFileSizeBytes: data.get('maxFileSizeBytes')
						? parseInt(data.get('maxFileSizeBytes') as string) * 1024 * 1024
						: null
				}
			});

			// Delete existing options and recreate them
			await prisma.questionOptionDraft.deleteMany({
				where: { questionId }
			});

			// Create new options if provided
			const optionsJson = data.get('options') as string;
			if (optionsJson) {
				const options = JSON.parse(optionsJson) as string[];
				await prisma.questionOptionDraft.createMany({
					data: options.map((text, index) => ({
						questionId,
						text: text.trim(),
						displayOrder: index,
						slug: slugify(text.trim())
					}))
				});
			}

			// Update the question link required field
			await prisma.questionLinkDraft.updateMany({
				where: { questionDraftId: questionId },
				data: { required }
			});

			// Get the updated question link with all includes
			const questionLink = await prisma.questionLinkDraft.findFirst({
				where: { questionDraftId: questionId },
				include: {
					questionDraft: {
						include: {
							options: {
								orderBy: {
									displayOrder: 'asc'
								}
							}
						}
					},
					questionVersion: {
						include: {
							options: {
								orderBy: {
									displayOrder: 'asc'
								}
							}
						}
					}
				}
			});

			// Update the form's updatedAt timestamp
			await prisma.applicationFormDraft.update({
				where: {
					id: params.form_id
				},
				data: {
					updatedAt: new Date()
				}
			});

			return { type: 'success', question: questionLink };
		} catch (error) {
			log.error('Error updating question', error);
			return { type: 'error', error: 'Failed to update question' };
		}
	},
	deleteQuestion: async ({ request, locals, params }) => {
		requireRole(locals, 'ADMIN');
		const data = await request.formData();

		const questionId = data.get('questionId') as string;

		if (!questionId) {
			return { type: 'error', error: 'Question ID is required' };
		}

		try {
			await prisma.questionLinkDraft.deleteMany({
				where: { questionDraftId: questionId }
			});

			// Update the form's updatedAt timestamp
			await prisma.applicationFormDraft.update({
				where: {
					id: params.form_id
				},
				data: {
					updatedAt: new Date()
				}
			});

			return { type: 'success' };
		} catch (error) {
			log.error('Error deleting question', error);
			return { type: 'error', error: 'Failed to delete question' };
		}
	}
} satisfies Actions;
