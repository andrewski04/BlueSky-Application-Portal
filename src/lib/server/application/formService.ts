import { prisma, prismaResult } from '$lib/server/prisma';
import type { Prisma, QuestionVersion } from '@prisma/client';
import { type Result, ok, err, AppError } from '$lib/utils/error';
import { FormDraftWithSectionsWithQuestionsWithOptions } from './formDraftArgs';

// Helper function, copies draft questions to immutable version
// Creates new QuestionTemplate if no templateId is provided
async function questionDraftToVersion(
	draft: Prisma.QuestionDraftGetPayload<{
		include: { options: { include: { questionOptionGroup: true } } };
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

	// create question version
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
			maxFileSizeBytes: draft.maxFileSizeBytes
		}
	});

	// Create option groups for this specific question draft
	// Each question gets its own unique groups, even if they have the same text
	const optionsWithGroups = draft.options.filter((o) => o.questionOptionGroup);

	// Group options by their group within this question
	// Multiple options can belong to the same group (same text + displayOrder)
	const optionsByGroup = new Map<string, typeof draft.options>();

	for (const option of optionsWithGroups) {
		if (option.questionOptionGroup) {
			// Create a unique key for this group within this question
			const groupKey = `${option.questionOptionGroup.text}-${option.questionOptionGroup.displayOrder}`;
			if (!optionsByGroup.has(groupKey)) {
				optionsByGroup.set(groupKey, []);
			}
			optionsByGroup.get(groupKey)!.push(option);
		}
	}

	// Create option groups first and store their IDs
	const groupIdMap = new Map<string, string>();
	for (const [groupKey, groupOptions] of optionsByGroup) {
		const firstOption = groupOptions[0];
		if (firstOption?.questionOptionGroup) {
			const group = await prisma.questionOptionGroup.create({
				data: {
					text: firstOption.questionOptionGroup.text,
					displayOrder: firstOption.questionOptionGroup.displayOrder
				}
			});
			groupIdMap.set(groupKey, group.id);
		}
	}

	// Create all options with proper group relationships
	await prisma.questionOption.createMany({
		data: draft.options.map((o) => {
			const optionData: Prisma.QuestionOptionCreateManyInput = {
				questionId: version.id,
				text: o.text,
				displayOrder: o.displayOrder,
				slug: o.slug
			};

			// If this option has a group, set the groupId
			if (o.questionOptionGroup) {
				const groupKey = `${o.questionOptionGroup.text}-${o.questionOptionGroup.displayOrder}`;
				const groupId = groupIdMap.get(groupKey);
				if (groupId) {
					optionData.questionOptionGroupId = groupId;
				}
			}

			return optionData;
		})
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
								questionDraft: { include: { options: { include: { questionOptionGroup: true } } } },
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
						displayOrder: sec.displayOrder,
						colorScheme: sec.colorScheme
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

type appPub = Prisma.ApplicationFormPublishedGetPayload<{
	include: {
		group: true;
		sections: {
			orderBy: { displayOrder: 'asc' };
			include: {
				questions: {
					include: {
						Answer: {
							include: {
								selectedOptions: { include: { option: true } };
								FileUpload: true;
							};
						};
						questionVersion: {
							include: {
								options: {
									orderBy: { displayOrder: 'asc' };
									include: { questionOptionGroup: true };
								};
							};
						};
					};
					orderBy: { displayOrder: 'asc' };
				};
			};
		};
	};
}>;

export async function getFormDraftPreview(formId: string): Promise<Result<appPub>> {
	const applicationForm = await prismaResult(
		prisma.applicationFormDraft.findUnique({
			where: { id: formId },
			...FormDraftWithSectionsWithQuestionsWithOptions
		})
	);

	if (applicationForm.isErr()) {
		return err(new AppError('Failed to fetch form draft'));
	}

	const draft = applicationForm.value;
	if (!draft) {
		return err(new AppError('Form draft not found'));
	}

	// Transform draft form to match the structure of getApplicationFormWithAnswers
	const transformedForm = {
		...draft,
		adminName: draft.name,
		active: true,
		archived: false,
		closeDate: null,
		openDate: null,
		groupId: null,
		publishedAt: new Date(),
		group: null,
		sections: draft.sections.map((sec) => ({
			...sec,
			questions: sec.questions.map((ql) => ({
				...ql,
				questionVersionId: ql.questionVersion?.id ?? ql.questionDraft?.id ?? 'DraftQuestion',
				questionVersion: ql.questionVersion
					? ql.questionVersion
					: {
							...ql.questionDraft,
							version: 1,
							createdAt: new Date(),
							templateId: 'DraftQuestion'
						},
				Answer: []
			}))
		}))
	};

	return ok(transformedForm);
}
