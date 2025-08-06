import { prisma, prismaResult } from '$lib/server/prisma';
import { ok, err, type Result, AppError } from '$lib/utils/error';
import { Logger } from '$lib/utils/logger';
import { QuestionType } from '@prisma/client';

const log = new Logger('FormResponseService');

export async function getSectionWithNavAndAnswers(applicationId: string, sectionSlug: string) {
	return prismaResult(
		prisma.$transaction(async (tx) => {
			// find applications published form id
			const { formId } = await tx.applicationResponse.findUniqueOrThrow({
				where: { id: applicationId },
				select: { formId: true }
			});

			// fetch section slug and find prev/next slugs
			const sections = await tx.formSectionPublished.findMany({
				where: { formId },
				select: { slug: true, displayOrder: true },
				orderBy: { displayOrder: 'asc' }
			});

			const idx = sections.findIndex((s) => s.slug === sectionSlug);
			if (idx === -1) throw new Error('Section not found in form');

			const prevSlug = idx > 0 ? sections[idx - 1].slug : null;
			const nextSlug = idx < sections.length - 1 ? sections[idx + 1].slug : null;

			// find section with answers
			const sec = await tx.formSectionPublished.findFirstOrThrow({
				where: { formId, slug: sectionSlug },
				include: {
					questions: {
						orderBy: { displayOrder: 'asc' },
						include: {
							questionVersion: {
								include: {
									options: { orderBy: { displayOrder: 'asc' } }
								}
							},
							Answer: {
								where: { applicationId },
								include: {
									selectedOptions: { include: { option: true } },
									FileUpload: true
								}
							}
						}
					}
				}
			});

			// map to SectionWithNav
			return {
				id: sec.id,
				name: sec.name,
				slug: sec.slug,
				displayOrder: sec.displayOrder,
				prevSlug,
				nextSlug,
				description: sec.description,
				formId,
				questions: sec.questions.map((ql) => {
					const ans = ql.Answer[0]; // 0 | 1 rows
					return {
						id: ql.questionVersion.id,
						createdAt: ql.questionVersion.createdAt,
						slug: ql.questionVersion.slug,
						templateId: ql.questionVersion.templateId,
						version: ql.questionVersion.version,
						prompt: ql.questionVersion.prompt,
						type: ql.questionVersion.type,
						required: ql.required,
						displayOrder: ql.displayOrder,
						options: ql.questionVersion.options,
						minLength: ql.questionVersion.minLength,
						maxLength: ql.questionVersion.maxLength,
						minValue: ql.questionVersion.minValue,
						maxValue: ql.questionVersion.maxValue,
						minDate: ql.questionVersion.minDate,
						maxDate: ql.questionVersion.maxDate,
						acceptedTypes: ql.questionVersion.acceptedTypes,
						maxFileSizeBytes: ql.questionVersion.maxFileSizeBytes,
						answer: ans
							? {
									id: ans.id,
									valueText: ans.valueText,
									valueNumber: ans.valueNumber,
									valueBool: ans.valueBool,
									valueDate: ans.valueDate,
									fileUploadId: ans.fileUploadId,
									file: ans.FileUpload ?? null,
									selections: ans.selectedOptions.map((sel) => ({
										id: sel.option.id,
										text: sel.option.text,
										displayOrder: sel.option.displayOrder
									}))
								}
							: null
					};
				})
			};
		})
	);
}

export async function saveApplicationSection(
	userId: string,
	formId: string,
	sectionSlug: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	responses: Record<string, any>
): Promise<Result<void>> {
	try {
		// create/fetch application response
		const application = await prisma.applicationResponse.upsert({
			where: { userId_formId: { userId, formId } },
			create: { userId, formId },
			update: {}
		});

		// load section and questions
		const section = await prisma.formSectionPublished.findFirstOrThrow({
			where: { formId, slug: sectionSlug },
			include: {
				questions: {
					orderBy: { displayOrder: 'asc' },
					include: {
						questionVersion: { include: { options: true } }
					}
				}
			}
		});

		await prisma.$transaction(async (tx) => {
			for (const ql of section.questions) {
				const qVer = ql.questionVersion;
				const raw = responses[qVer.id];
				if (raw === undefined) continue; // untouched question

				// normalize multiple choice into string[]
				const optionIds: string[] =
					qVer.type === QuestionType.CHECKBOX ||
					qVer.type === QuestionType.MULTIPLE_CHOICE ||
					qVer.type === QuestionType.DROPDOWN
						? Array.isArray(raw)
							? raw.map(String)
							: raw != null
								? [String(raw)]
								: []
						: [];

				// fields to update
				const scalars = (() => {
					switch (qVer.type) {
						case QuestionType.TEXT:
						case QuestionType.PARAGRAPH:
							return { valueText: raw?.toString() ?? null };
						case QuestionType.NUMBER:
							return { valueNumber: raw ? parseFloat(raw) : null };
						case QuestionType.DATE:
							return { valueDate: raw ? new Date(raw) : null };
						case QuestionType.FILE_UPLOAD:
							return { fileUploadId: raw ?? null };
						default:
							return {};
					}
				})();

				// payloads for creating and updating
				const selectionsCreate = optionIds.length
					? { createMany: { data: optionIds.map((id) => ({ optionId: id })) } }
					: undefined;

				const selectionsUpdate = {
					deleteMany: {}, // clear previous selections
					...selectionsCreate
				};

				// update or create answer
				await tx.answer.upsert({
					where: {
						applicationId_questionVersionId: {
							applicationId: application.id,
							questionVersionId: qVer.id
						}
					},
					create: {
						applicationId: application.id,
						questionVersionId: qVer.id,
						publishedSectionId: section.id,
						publishedDisplayOrder: ql.displayOrder,
						...scalars,
						selectedOptions: selectionsCreate // no deleteMany
					},
					update: {
						...scalars,
						selectedOptions: selectionsUpdate // delete + insert
					}
				});
			}

			// update application response timestamp
			await tx.applicationResponse.update({
				where: { id: application.id },
				data: { updatedAt: new Date() }
			});
		});

		return ok(undefined);
	} catch (e) {
		log.error('Error saving application section', e);
		return err(new AppError('Error saving application response', 'ERR_SAVE_APPLICATION_RESPONSE'));
	}
}

// Helper function to transform answer data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAnswer(ans: any) {
	if (!ans) return null;

	return {
		id: ans.id,
		valueText: ans.valueText,
		valueNumber: ans.valueNumber,
		valueBool: ans.valueBool,
		valueDate: ans.valueDate,
		fileUploadId: ans.fileUploadId,
		file: ans.FileUpload ?? null,
		selections: ans.selectedOptions.map(
			(sel: { option: { id: string; text: string; displayOrder: number } }) => ({
				id: sel.option.id,
				text: sel.option.text,
				displayOrder: sel.option.displayOrder
			})
		)
	};
}

// Helper function to transform question data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQuestion(ql: any, ansMap: Map<string, any>) {
	const qv = ql.questionVersion;
	const ans = ansMap.get(qv.id);

	return {
		id: qv.id,
		templateId: qv.templateId,
		version: qv.version,
		prompt: qv.prompt,
		type: qv.type,
		slug: qv.slug,
		minLength: qv.minLength,
		maxLength: qv.maxLength,
		minValue: qv.minValue,
		maxValue: qv.maxValue,
		minDate: qv.minDate,
		maxDate: qv.maxDate,
		acceptedTypes: qv.acceptedTypes,
		maxFileSizeBytes: qv.maxFileSizeBytes,
		createdAt: qv.createdAt,
		required: ql.required,
		displayOrder: ql.displayOrder,
		options: qv.options,
		answer: transformAnswer(ans)
	};
}

export async function getApplicationFormWithAnswers(applicationId: string) {
	return prismaResult(
		prisma.$transaction(async (tx) => {
			// get formId from application response
			const application = await tx.applicationResponse.findUniqueOrThrow({
				where: { id: applicationId },
				select: { formId: true, user: true, updatedAt: true, status: true }
			});

			// load all answers
			const answers = await tx.answer.findMany({
				where: { applicationId },
				include: {
					selectedOptions: { include: { option: true } },
					FileUpload: true
				}
			});

			// map questionVersionId to answer
			const ansMap = new Map(answers.map((a) => [a.questionVersionId, a]));

			const form = await tx.applicationFormPublished.findUniqueOrThrow({
				where: { id: application.formId },
				include: {
					sections: {
						orderBy: { displayOrder: 'asc' },
						include: {
							questions: {
								orderBy: { displayOrder: 'asc' },
								include: {
									questionVersion: {
										include: {
											options: { orderBy: { displayOrder: 'asc' } }
										}
									}
								}
							}
						}
					}
				}
			});

			return {
				...form,
				user: application.user,
				updatedAt: application.updatedAt,
				status: application.status,
				sections: form.sections.map((sec) => ({
					...sec,
					questions: sec.questions.map((ql) => transformQuestion(ql, ansMap))
				}))
			};
		})
	);
}

export async function submitApplication(
	userId: string,
	formId: string,
	formGroupId: string | null
) {
	// add validation here!!
	return prismaResult(
		prisma.$transaction(async (tx) => {
			// update application response status
			await tx.applicationResponse.update({
				where: { userId_formId: { userId, formId } },
				data: { status: 'SUBMITTED' }
			});

			// update submission group to form group
			await tx.applicationResponse.update({
				where: { userId_formId: { userId, formId } },
				data: { formGroupId }
			});
		})
	);
}

export async function saveApplicationQuestion(
	userId: string,
	formId: string,
	questionVersionId: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any
): Promise<Result<void>> {
	try {
		// create/fetch application response
		const application = await prisma.applicationResponse.upsert({
			where: { userId_formId: { userId, formId } },
			create: { userId, formId },
			update: {}
		});

		// load question version to get type and section info
		const questionLink = await prisma.questionLinkPublished.findFirstOrThrow({
			where: {
				questionVersionId,
				section: { formId }
			},
			include: {
				questionVersion: {
					include: { options: true },
					select: { type: true }
				},
				section: {
					select: { id: true }
				}
			}
		});

		const qVer = questionLink.questionVersion;

		// normalize multiple choice into string[]
		const optionIds: string[] =
			qVer.type === QuestionType.CHECKBOX ||
			qVer.type === QuestionType.MULTIPLE_CHOICE ||
			qVer.type === QuestionType.DROPDOWN
				? Array.isArray(value)
					? value.map(String)
					: value != null
						? [String(value)]
						: []
				: [];

		// fields to update
		const scalars = (() => {
			switch (qVer.type) {
				case QuestionType.TEXT:
				case QuestionType.PARAGRAPH:
					return { valueText: value?.toString() ?? null };
				case QuestionType.NUMBER:
					return { valueNumber: value ? parseFloat(value) : null };
				case QuestionType.DATE:
					return { valueDate: value ? new Date(value) : null };
				case QuestionType.FILE_UPLOAD:
					return { fileUploadId: value ?? null };
				default:
					return {};
			}
		})();

		// payloads for creating and updating
		const selectionsCreate = optionIds.length
			? { createMany: { data: optionIds.map((id) => ({ optionId: id })) } }
			: undefined;

		const selectionsUpdate = {
			deleteMany: {}, // clear previous selections
			...selectionsCreate
		};

		// update or create answer
		await prisma.answer.upsert({
			where: {
				applicationId_questionVersionId: {
					applicationId: application.id,
					questionVersionId: qVer.id
				}
			},
			create: {
				applicationId: application.id,
				questionVersionId: qVer.id,
				publishedSectionId: questionLink.section.id,
				publishedDisplayOrder: questionLink.displayOrder,
				...scalars,
				selectedOptions: selectionsCreate // no deleteMany
			},
			update: {
				...scalars,
				selectedOptions: selectionsUpdate // delete + insert
			}
		});

		// update application response timestamp
		await prisma.applicationResponse.update({
			where: { id: application.id },
			data: { updatedAt: new Date() }
		});

		return ok(undefined);
	} catch (e) {
		log.error('Error saving application question', e);
		return err(new AppError('Error saving application response', 'ERR_SAVE_APPLICATION_RESPONSE'));
	}
}
