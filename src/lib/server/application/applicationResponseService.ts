import { prisma } from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { AppError, err, ok, type Result } from '$lib/utils/error';

type ApplicationResponseWithUser = Prisma.ApplicationResponseGetPayload<{
	include: {
		user: true;
	};
}>;
/**
 * Retrieves all application responses without any additional relations.
 *
 * @returns A Promise resolving to a Result containing an array of ApplicationResponse.
 * @throws Will return an error Result if there's an issue fetching the application responses.
 */
export async function getAllApplicationResponsesWithUser(): Promise<
	Result<ApplicationResponseWithUser[]>
> {
	try {
		const applicationResponses = await prisma.applicationResponse.findMany({
			include: {
				user: true
			}
		});
		return ok(applicationResponses);
	} catch (error) {
		console.error(error);
		return err(
			new AppError('Error getting all application responses', 'ERR_GET_ALL_APPLICATION_RESPONSES')
		);
	}
}

type ApplicationResponseWithSelectedOptionsAndUser = Prisma.ApplicationResponseGetPayload<{
	include: {
		answers: {
			include: {
				selectedOptions: true;
				question: {
					include: {
						section: true;
					};
				};
			};
		};
		user: true;
	};
}>;

/**
 * Retrieves a specific application response by its ID with detailed related information.
 *
 * @param id The unique identifier of the application response.
 * @returns A Promise resolving to a Result containing the ApplicationResponse with selected options and user details, or null if not found.
 * @throws Will return an error Result if there's an issue fetching the application response.
 */
export async function getApplicationResponseById(
	id: string
): Promise<Result<ApplicationResponseWithSelectedOptionsAndUser | null>> {
	try {
		const applicationResponse = await prisma.applicationResponse.findUnique({
			where: {
				id: id
			},
			include: {
				answers: {
					include: {
						selectedOptions: true,
						question: {
							include: {
								section: true
							}
						}
					}
				},
				user: true
			}
		});
		return ok(applicationResponse);
	} catch (error) {
		console.error(error);
		return err(new AppError('INTERNAL_SERVER_ERROR', 'Error getting all application responses'));
	}
}

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
					if (existingAnswer) {
						await prisma.answerOptionSelection.deleteMany({
							where: {
								answerId: existingAnswer.id
							}
						});
					}
					answerData = {
						question: { connect: { id: questionId } },
						selectedOptions: {
							create: selectedOptionIds.map((optionId) => ({
								optionId: optionId
							}))
						}
					};
					break;
				case 'FILE_UPLOAD':
					// file uploads not yet handled
					answerData = {
						question: { connect: { id: questionId } },
						FileUpload: answerValue ? { connect: { id: answerValue } } : undefined
					};
					break;
				default:
					console.warn(`Unhandled question type: ${question.type}`);
					continue;
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
