import { prisma, prismaResult } from '$lib/server/prisma';
import { ok, err, type Result, AppError } from '$lib/utils/error';
import { Logger } from '$lib/utils/logger';
import { QuestionType } from '@prisma/client';

const log = new Logger('FormResponseService');

export async function getApplicationFormWithAnswers(applicationId: string, formId: string) {
	return prismaResult(
		prisma.applicationFormPublished.findUniqueOrThrow({
			where: { id: formId },
			include: {
				group: true,
				sections: {
					orderBy: { displayOrder: 'asc' },
					include: {
						questions: {
							include: {
								Answer: {
									where: { applicationId },
									include: {
										selectedOptions: { include: { option: true } },
										FileUpload: true
									}
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
		})
	);
}

export async function submitApplication(
	userId: string,
	formId: string,
	formGroupId: string | null
) {
	// Get the application response to find the application ID
	const applicationResponse = await prisma.applicationResponse.findUnique({
		where: { userId_formId: { userId, formId } },
		select: { id: true }
	});

	if (!applicationResponse) {
		return err(new AppError('Application not found', 'ERR_APPLICATION_NOT_FOUND'));
	}

	// Get the form with all answers for validation
	const formWithAnswersResult = await getApplicationFormWithAnswers(applicationResponse.id, formId);
	if (!formWithAnswersResult.isOk()) {
		return formWithAnswersResult;
	}

	// Validate all questions
	const validationResult = validateApplicationAnswers(formWithAnswersResult.unwrap());
	if (!validationResult.isValid) {
		return err(new AppError(validationResult.errorMessage, 'ERR_VALIDATION_FAILED'));
	}

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

interface ValidationResult {
	isValid: boolean;
	errorMessage: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateApplicationAnswers(formWithAnswers: any): ValidationResult {
	for (const section of formWithAnswers.sections) {
		for (const question of section.questions) {
			const questionLink = question.questionVersion;
			const answer = question.Answer[0]; // Get the answer for this question
			const isRequired = question.required;

			// Check if required questions are answered
			if (isRequired && !answer) {
				return {
					isValid: false,
					errorMessage: `Required question "${questionLink.prompt}" is not answered.`
				};
			}

			// If question is not required and has no answer, skip validation
			if (!isRequired && !answer) {
				continue;
			}

			// If question is not required but has an answer, validate the answer
			if (answer) {
				const validationResult = validateAnswer(answer, questionLink);
				if (!validationResult.isValid) {
					return validationResult;
				}
			}
		}
	}

	return { isValid: true, errorMessage: '' };
}

function validateAnswer(
	answer: {
		valueText: string | null;
		valueNumber: number | null;
		valueDate: Date | null;
		fileUploadId: string | null;
		selectedOptions: { optionId: string }[];
	},
	questionVersion: {
		type: QuestionType;
		minLength: number | null;
		maxLength: number | null;
		minValue: number | null;
		maxValue: number | null;
		minDate: Date | null;
		maxDate: Date | null;
		prompt: string;
	}
): ValidationResult {
	const { type, minLength, maxLength, minValue, maxValue, minDate, maxDate } = questionVersion;

	switch (type) {
		case QuestionType.TEXT:
		case QuestionType.PARAGRAPH:
			return validateTextAnswer(answer.valueText, minLength, maxLength, questionVersion.prompt);

		case QuestionType.NUMBER:
			return validateNumberAnswer(answer.valueNumber, minValue, maxValue, questionVersion.prompt);

		case QuestionType.DATE:
			return validateDateAnswer(answer.valueDate, minDate, maxDate, questionVersion.prompt);

		case QuestionType.FILE_UPLOAD:
			return validateFileUploadAnswer(answer.fileUploadId);

		case QuestionType.MULTIPLE_CHOICE:
		case QuestionType.DROPDOWN:
		case QuestionType.CHECKBOX:
			return validateChoiceAnswer(answer.selectedOptions);

		default:
			return { isValid: true, errorMessage: '' };
	}
}

function validateTextAnswer(
	value: string | null,
	minLength: number | null,
	maxLength: number | null,
	prompt: string
): ValidationResult {
	if (value === null || value === undefined) {
		return { isValid: true, errorMessage: '' }; // Not required or empty
	}

	const textValue = value.toString().trim();

	if (minLength !== null && textValue.length < minLength) {
		return {
			isValid: false,
			errorMessage: `Question "${prompt}" must be at least ${minLength} characters long.`
		};
	}

	if (maxLength !== null && textValue.length > maxLength) {
		return {
			isValid: false,
			errorMessage: `Question "${prompt}" must be no more than ${maxLength} characters long.`
		};
	}

	return { isValid: true, errorMessage: '' };
}

function validateNumberAnswer(
	value: number | null,
	minValue: number | null,
	maxValue: number | null,
	prompt: string
): ValidationResult {
	if (value === null || value === undefined) {
		return { isValid: true, errorMessage: '' }; // Not required or empty
	}

	if (minValue !== null && value < minValue) {
		return {
			isValid: false,
			errorMessage: `Question "${prompt}" must be at least ${minValue}.`
		};
	}

	if (maxValue !== null && value > maxValue) {
		return {
			isValid: false,
			errorMessage: `Question "${prompt}" must be no more than ${maxValue}.`
		};
	}

	return { isValid: true, errorMessage: '' };
}

function validateDateAnswer(
	value: Date | null,
	minDate: Date | null,
	maxDate: Date | null,
	prompt: string
): ValidationResult {
	if (value === null || value === undefined) {
		return { isValid: true, errorMessage: '' }; // Not required or empty
	}

	if (minDate !== null && value < minDate) {
		return {
			isValid: false,
			errorMessage: `Question "${prompt}" must be on or after ${minDate.toLocaleDateString()}.`
		};
	}

	if (maxDate !== null && value > maxDate) {
		return {
			isValid: false,
			errorMessage: `Question "${prompt}" must be on or before ${maxDate.toLocaleDateString()}.`
		};
	}

	return { isValid: true, errorMessage: '' };
}

function validateFileUploadAnswer(fileUploadId: string | null): ValidationResult {
	if (fileUploadId === null || fileUploadId === undefined || fileUploadId === '') {
		return { isValid: true, errorMessage: '' }; // Not required or empty
	}

	// File upload validation is handled elsewhere (file existence check)
	return { isValid: true, errorMessage: '' };
}

function validateChoiceAnswer(selectedOptions: { optionId: string }[]): ValidationResult {
	if (!selectedOptions || selectedOptions.length === 0) {
		return { isValid: true, errorMessage: '' }; // Not required or empty
	}

	// Choice questions are valid if they have selected options
	return { isValid: true, errorMessage: '' };
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

		// For file uploads, validate that the file exists if a value is provided
		if (qVer.type === QuestionType.FILE_UPLOAD && value != null && value !== '') {
			const fileExists = await prisma.fileUpload.findUnique({
				where: { id: value }
			});
			if (!fileExists) {
				log.error('File upload ID does not exist', { fileUploadId: value });
				return err(new AppError('File not found', 'ERR_FILE_NOT_FOUND'));
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
					return { fileUploadId: value && value !== '' ? value : null };
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

		// For file uploads, we need to handle the case where the old file might have been deleted
		// First, check if there's an existing answer and if its fileUploadId is still valid
		if (qVer.type === QuestionType.FILE_UPLOAD) {
			const existingAnswer = await prisma.answer.findUnique({
				where: {
					applicationId_questionVersionId: {
						applicationId: application.id,
						questionVersionId: qVer.id
					}
				},
				select: { fileUploadId: true }
			});

			// If there's an existing answer with a fileUploadId, verify the file still exists
			if (existingAnswer?.fileUploadId) {
				const oldFileExists = await prisma.fileUpload.findUnique({
					where: { id: existingAnswer.fileUploadId }
				});

				// If the old file was deleted, clear the reference first
				if (!oldFileExists) {
					await prisma.answer.update({
						where: {
							applicationId_questionVersionId: {
								applicationId: application.id,
								questionVersionId: qVer.id
							}
						},
						data: { fileUploadId: null }
					});
				}
			}
		}

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
