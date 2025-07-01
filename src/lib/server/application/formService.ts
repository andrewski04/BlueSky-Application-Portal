import { prisma, prismaResult } from '$lib/server/prisma';
import type { Prisma, QuestionVersion } from '@prisma/client';
import { type Result, ok, err, AppError } from '$lib/utils/error';

// Helper function, copies draft questions to immutable version
// Creates new QuestionTemplate if no templateId is provided
async function questionDraftToVersion(
	draft: Prisma.QuestionDraftGetPayload<{
		include: { options: true };
	}>
): Promise<Result<QuestionVersion>> {
	// create or reuse template
	const templateRes = draft.templateId
		? await prismaResult(prisma.questionTemplate.findUnique({ where: { id: draft.templateId } }))
		: await prismaResult(
				prisma.questionTemplate.create({
					data: {
						slug: draft.slug,
						displayName: draft.prompt,
						inLibrary: false
					}
				})
			);

	if (templateRes.isErr() || templateRes.value == null) {
		return err(new AppError('Failed to create or find question template'));
	}

	const template = templateRes.value;

	// bump version number
	const nextVersion =
		(await prisma.questionVersion.count({ where: { templateId: template.id } })) + 1;

	// create question version + its options
	const version = await prisma.questionVersion.create({
		data: {
			templateId: template.id,
			version: nextVersion,
			prompt: draft.prompt,
			type: draft.type,
			slug: draft.slug,
			minLength: draft.minLength,
			maxLength: draft.maxLength,
			minValue: draft.minValue,
			maxValue: draft.maxValue,
			minDate: draft.minDate,
			maxDate: draft.maxDate,
			acceptedTypes: draft.acceptedTypes,
			maxFileSizeBytes: draft.maxFileSizeBytes,
			options: draft.options.length
				? {
						createMany: {
							data: draft.options.map((o) => ({
								text: o.text,
								displayOrder: o.displayOrder,
								slug: o.slug
							}))
						}
					}
				: undefined
		}
	});

	// update current version in template
	await prisma.questionTemplate.update({
		where: { id: template.id },
		data: { currentVersionId: version.id }
	});

	return ok(version);
}

// Publish a form from a draft
export async function publishFormFromDraft(
	draftId: string,
	{ active = true } = {}
): Promise<Result<{ publishedId: string }>> {
	try {
		// loads draft form
		const draft = await prisma.applicationFormDraft.findUniqueOrThrow({
			where: { id: draftId },
			include: {
				sections: {
					orderBy: { displayOrder: 'asc' },
					include: {
						questions: {
							orderBy: { displayOrder: 'asc' },
							include: {
								questionDraft: { include: { options: true } },
								questionVersion: true
							}
						}
					}
				}
			}
		});

		// checks draft form has atleast one section
		if (draft.sections.length === 0) {
			return err(new AppError('Form draft must have atleast one section'));
		}

		// transaction to create published form
		const result = await prisma.$transaction(async (tx) => {
			// create published form header
			const formPub = await tx.applicationFormPublished.create({
				data: {
					name: draft.name,
					description: draft.description,
					active
				}
			});

			// copy draft sections to published form
			for (const sec of draft.sections) {
				const secPub = await tx.formSectionPublished.create({
					data: {
						formId: formPub.id,
						name: sec.name,
						slug: sec.slug,
						description: sec.description,
						displayOrder: sec.displayOrder
					}
				});

				// copy question links to question versions
				for (const link of sec.questions) {
					let versionId: string;

					if (link.questionVersion) {
						// library questions stay the same
						versionId = link.questionVersion.id;
					} else if (link.questionDraft) {
						// draft questions are copied to immutable versions
						const newVer = await questionDraftToVersion(link.questionDraft);
						if (newVer.isErr()) {
							throw newVer.error;
						}
						versionId = newVer.value.id;
					} else {
						throw new Error('Question link missing both draft & version');
					}

					await tx.questionLinkPublished.create({
						data: {
							sectionId: secPub.id,
							questionVersionId: versionId,
							displayOrder: link.displayOrder,
							required: link.required
						}
					});
				}
			}

			return { publishedId: formPub.id };
		});

		return ok(result);
	} catch (e) {
		console.error('Publish error', e);
		return err(new AppError('Failed to publish form', 'ERR_PUBLISH_FORM'));
	}
}
