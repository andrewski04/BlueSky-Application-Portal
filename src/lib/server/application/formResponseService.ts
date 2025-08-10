import { prisma, prismaResult } from '$lib/server/prisma';
import { ok, err, type Result, AppError } from '$lib/utils/error';
import { Logger } from '$lib/utils/logger';
import { QuestionType } from '@prisma/client';

const log = new Logger('FormResponseService');

// Helper function to transform answer data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAnswer(ans: any) {
	if (!ans) return null;

	const result = {
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

	return result;
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
					group: true,
					sections: {
						orderBy: { displayOrder: 'asc' },
						include: {
							questions: {
								include: {
									Answer: {
										where: { applicationId }
									},
									questionVersion: {
										include: {
											options: { orderBy: { displayOrder: 'asc' } }
										}
									}
								},
								orderBy: { displayOrder: 'asc' }
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
					include: { options: true }
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

		// Validate option IDs exist for choice questions
		if (optionIds.length > 0) {
			const validOptionIds = qVer.options.map((opt) => opt.id);
			const invalidOptionIds = optionIds.filter((id) => !validOptionIds.includes(id));

			if (invalidOptionIds.length > 0) {
				log.error('Invalid option IDs provided', { invalidOptionIds, validOptionIds });
				return err(new AppError('Invalid option selected', 'ERR_INVALID_OPTION'));
			}
		}

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

		const selectionsUpdate = selectionsCreate
			? {
					deleteMany: {}, // clear previous selections
					...selectionsCreate
				}
			: {
					deleteMany: {} // clear previous selections only
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

export async function getAllAvailableApplicationForms(userId: string) {
	return prismaResult(
		prisma.applicationFormPublished.findMany({
			where: {
				active: true,
				archived: false,
				OR: [
					// Forms with no date constraints
					{
						openDate: null,
						closeDate: null
					},
					// Forms with only open date that has passed
					{
						openDate: {
							lte: new Date()
						},
						closeDate: null
					},
					// Forms with only close date that hasn't passed
					{
						openDate: null,
						closeDate: {
							gte: new Date()
						}
					},
					// Forms with both dates that are currently valid
					{
						openDate: {
							lte: new Date()
						},
						closeDate: {
							gte: new Date()
						}
					}
				]
			},
			include: {
				responses: {
					where: {
						userId
					}
				}
			}
		})
	);
}

export function checkApplicationReadOnly(application: {
	status: string;
	form: {
		closeDate: Date | null;
		openDate: Date | null;
		active: boolean;
		archived: boolean;
	};
}): { isReadOnly: boolean; readOnlyMessage: string } {
	// Check if form is already submitted
	if (application.status !== 'DRAFT') {
		return {
			isReadOnly: true,
			readOnlyMessage: 'This form has been submitted and is no longer editable.'
		};
	}

	// Check if form is archived
	if (application.form.archived) {
		return {
			isReadOnly: true,
			readOnlyMessage: 'This form is archived and is no longer available.'
		};
	}

	// Check if form is closed (only if closeDate is set)
	if (application.form.closeDate && application.form.closeDate < new Date()) {
		return {
			isReadOnly: true,
			readOnlyMessage: `This form is no longer available. It closed on ${application.form.closeDate.toLocaleDateString()}.`
		};
	}

	// Check if form is disabled
	if (!application.form.active) {
		return {
			isReadOnly: true,
			readOnlyMessage: 'This form is currently disabled and not available for submissions.'
		};
	}

	// Check if form is not yet open (only if openDate is set)
	if (application.form.openDate && application.form.openDate > new Date()) {
		return {
			isReadOnly: true,
			readOnlyMessage: `This form is not yet available. It will open on ${application.form.openDate.toLocaleDateString()}.`
		};
	}

	// Form is valid and editable
	return {
		isReadOnly: false,
		readOnlyMessage: ''
	};
}
