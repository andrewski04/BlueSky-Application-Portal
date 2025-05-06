import { prisma } from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { AppError, err, ok, type Result } from '$lib/util/error';

/**
 * Saves the responses for a section of an application.
 *
 * @param userId The ID of the user.
 * @param formId The ID of the application form.
 * @param sectionId The ID of the section.
 * @param responses A record where keys are question IDs and values are the answers.
 * @returns A Promise that resolves when the responses are saved.
 */
export async function saveApplicationSection(
	userId: string,
	formId: string,
	sectionSlug: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	responses: Record<string, any>
): Promise<Result<void>> {
	try {
		let application = await prisma.applicationResponse.findUnique({
			where: {
				userId_formId: {
					userId: userId,
					formId: formId
				}
			},
			include: {
				answers: {
					include: {
						selectedOptions: true
					}
				}
			}
		});

		if (!application) {
			application = await prisma.applicationResponse.create({
				data: {
					userId: userId,
					formId: formId,
					status: 'DRAFT'
				},
				include: {
					answers: {
						include: {
							selectedOptions: true
						}
					}
				}
			});
		}

		const questionIds = Object.keys(responses);

		// Fetch questions to determine their types
		const questions = await prisma.formQuestion.findMany({
			where: {
				id: {
					in: questionIds
				},
				section: {
					slug: sectionSlug
				}
			},
			include: {
				options: true
			}
		});

		const questionMap = new Map(questions.map((q) => [q.id, q]));

		for (const questionId of questionIds) {
			const answerValue = responses[questionId];
			const question = questionMap.get(questionId);

			if (!question) {
				console.warn(`Question with ID ${questionId} not found in section ${sectionSlug}`);
				continue; // Skip if question not found in the section
			}

			const existingAnswer = application.answers.find((a) => a.questionId === questionId);

			// Use correct Prisma type based on whether updating or creating
			let answerData:
				| Prisma.AnswerCreateWithoutApplicationInput
				| Prisma.AnswerUpdateWithoutApplicationInput;

			// Handle selected options separately for option-based questions
			let selectedOptionIds: string[] = [];
			if (
				question.type === 'CHECKBOX' ||
				question.type === 'MULTIPLE_CHOICE' ||
				question.type === 'DROPDOWN'
			) {
				selectedOptionIds = Array.isArray(answerValue)
					? answerValue.map(String)
					: typeof answerValue === 'string'
						? [answerValue]
						: [];
			}

			// Set the appropriate value field based on question type
			switch (question.type) {
				case 'TEXT':
				case 'PARAGRAPH':
					answerData = {
						question: { connect: { id: questionId } },
						valueText: answerValue?.toString() || null
					};
					break;
				case 'NUMBER':
					answerData = {
						question: { connect: { id: questionId } },
						valueNumber: answerValue ? parseFloat(answerValue) : null
					};
					break;
				case 'DATE':
					answerData = {
						question: { connect: { id: questionId } },
						valueDate: answerValue ? new Date(answerValue) : null
					};
					break;
				case 'CHECKBOX':
				case 'MULTIPLE_CHOICE':
				case 'DROPDOWN':
					answerData = {
						question: { connect: { id: questionId } },
						selectedOptions: {
							deleteMany: {}, // Delete existing selections for this answer
							create: selectedOptionIds.map((optionId) => ({
								optionId: optionId
							}))
						}
					};
					break;
				case 'FILE_UPLOAD':
					// Assuming answerValue is the fileUploadId
					answerData = {
						question: { connect: { id: questionId } },
						FileUpload: answerValue ? { connect: { id: answerValue } } : undefined // Use connect for relation
					};
					break;
				default:
					console.warn(`Unhandled question type: ${question.type}`);
					continue; // Skip if unhandled type
			}

			if (existingAnswer) {
				// Update existing answer
				await prisma.answer.update({
					where: { id: existingAnswer.id },
					data: answerData as Prisma.AnswerUpdateInput // Cast for update
				});
			} else {
				// Create new answer
				const createData: Prisma.AnswerCreateInput = {
					application: { connect: { id: application.id } },
					question: { connect: { id: questionId } },
					valueText: (answerData as Prisma.AnswerCreateWithoutApplicationInput).valueText,
					valueNumber: (answerData as Prisma.AnswerCreateWithoutApplicationInput).valueNumber,
					valueDate: (answerData as Prisma.AnswerCreateWithoutApplicationInput).valueDate,
					selectedOptions: (answerData as Prisma.AnswerCreateWithoutApplicationInput)
						.selectedOptions,
					FileUpload: (answerData as Prisma.AnswerCreateWithoutApplicationInput).FileUpload
				};

				await prisma.answer.create({
					data: createData
				});
			}
		}

		// Update application timestamp
		await prisma.applicationResponse.update({
			where: { id: application.id },
			data: {
				updatedAt: new Date()
			}
		});

		return ok(undefined);
	} catch (error) {
		console.error(error);
		return err(new AppError('Error saving application section', 'ERR_SAVE_APPLICATION_SECTION'));
	}
}

/**
 * Retrieves an application response by user ID and form ID.
 * Includes related answers and their selected options.
 *
 * @param userId The ID of the user.
 * @param formId The ID of the application form.
 * @returns A Promise that resolves with the application response, or null if not found.
 */
export async function getApplicationByUserIdAndFormId(
	userId: string,
	formId: string
): Promise<Prisma.ApplicationResponseGetPayload<{
	include: { answers: { include: { selectedOptions: true; question: true } } };
}> | null> {
	const application = await prisma.applicationResponse.findUnique({
		where: {
			userId_formId: {
				userId: userId,
				formId: formId
			}
		},
		include: {
			answers: {
				include: {
					selectedOptions: true,
					question: true // Include question to get type and options if needed
				}
			}
		}
	});
	return application;
}
