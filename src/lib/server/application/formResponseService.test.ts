import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma, prismaResult } from '../prisma';
import { AppError } from '$lib/utils/error';
import { QuestionType } from '@prisma/client';
import { ok, err } from '$lib/utils/error';

// Mock the prisma module
vi.mock('../prisma', () => ({
	prisma: {
		applicationFormPublished: {
			findUniqueOrThrow: vi.fn(),
			findMany: vi.fn()
		},
		applicationResponse: {
			findUnique: vi.fn(),
			upsert: vi.fn(),
			update: vi.fn()
		},
		questionLinkPublished: {
			findFirstOrThrow: vi.fn()
		},
		answer: {
			upsert: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn()
		},
		fileUpload: {
			findUnique: vi.fn()
		},
		$transaction: vi.fn()
	},
	prismaResult: vi.fn()
}));

// Mock the logger
vi.mock('$lib/utils/logger', () => ({
	Logger: vi.fn().mockImplementation(() => ({
		error: vi.fn(),
		info: vi.fn()
	}))
}));

describe('FormResponseService', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockPrismaResult = vi.mocked(prismaResult);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getApplicationFormWithAnswers', () => {
		const mockApplicationId = 'app-123';
		const mockFormId = 'form-123';

		it('should return application form with answers successfully', async () => {
			const mockForm = {
				id: mockFormId,
				name: 'Test Form',
				active: true,
				archived: false,
				group: null,
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						questions: [
							{
								id: 'question-1',
								required: true,
								Answer: [
									{
										id: 'answer-1',
										valueText: 'Test answer',
										selectedOptions: [],
										FileUpload: null
									}
								],
								questionVersion: {
									id: 'version-1',
									prompt: 'Test question?',
									type: QuestionType.TEXT,
									options: []
								}
							}
						]
					}
				]
			};

			(mockPrismaResult as any).mockResolvedValue(ok(mockForm));

			const { getApplicationFormWithAnswers } = await import('./formResponseService');
			const result = await getApplicationFormWithAnswers(mockApplicationId, mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toEqual(mockForm);
			}
		});

		it('should handle prisma errors gracefully', async () => {
			(mockPrismaResult as any).mockResolvedValue(err(new Error('Database error')));

			const { getApplicationFormWithAnswers } = await import('./formResponseService');
			const result = await getApplicationFormWithAnswers(mockApplicationId, mockFormId);

			expect(result.isErr()).toBe(true);
		});
	});

	describe('submitApplication', () => {
		const mockUserId = 'user-123';
		const mockFormId = 'form-123';
		const mockFormGroupId = 'group-123';

		it('should submit application successfully', async () => {
			const mockApplicationResponse = { id: 'app-123' };
			const mockFormWithAnswers = {
				sections: [
					{
						questions: [
							{
								required: true,
								Answer: [{ valueText: 'Test answer' }],
								questionVersion: { prompt: 'Test question?' }
							}
						]
					}
				]
			};

			(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(mockApplicationResponse);
			(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));
			(mockPrisma.$transaction as any).mockImplementation(async (callback: any) => {
				return await callback(mockPrisma);
			});

			const { submitApplication } = await import('./formResponseService');
			const result = await submitApplication(mockUserId, mockFormId, mockFormGroupId);

			expect(result.isOk()).toBe(true);
		});

		it('should return error when application not found', async () => {
			(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(null);

			const { submitApplication } = await import('./formResponseService');
			const result = await submitApplication(mockUserId, mockFormId, mockFormGroupId);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe('Application not found');
			}
		});

		it('should return error when form fetch fails', async () => {
			const mockApplicationResponse = { id: 'app-123' };
			(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(mockApplicationResponse);
			(mockPrismaResult as any).mockResolvedValue(err(new Error('Form fetch failed')));

			const { submitApplication } = await import('./formResponseService');
			const result = await submitApplication(mockUserId, mockFormId, mockFormGroupId);

			expect(result.isErr()).toBe(true);
		});

		it('should return error when validation fails', async () => {
			const mockApplicationResponse = { id: 'app-123' };
			const mockFormWithAnswers = {
				sections: [
					{
						questions: [
							{
								required: true,
								Answer: [], // Missing required answer
								questionVersion: { prompt: 'Test question?' }
							}
						]
					}
				]
			};

			(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(mockApplicationResponse);
			(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

			const { submitApplication } = await import('./formResponseService');
			const result = await submitApplication(mockUserId, mockFormId, mockFormGroupId);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toContain('Required question');
			}
		});

		it('should handle transaction errors', async () => {
			const mockApplicationResponse = { id: 'app-123' };
			const mockFormWithAnswers = {
				sections: [
					{
						questions: [
							{
								required: true,
								Answer: [{ valueText: 'Test answer' }],
								questionVersion: { prompt: 'Test question?' }
							}
						]
					}
				]
			};

			(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(mockApplicationResponse);
			(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

			// Mock the transaction to throw an error
			(mockPrisma.$transaction as any).mockImplementation(async (callback: any) => {
				throw new Error('Transaction failed');
			});

			// Mock prismaResult to return an error when called with the transaction
			(mockPrismaResult as any)
				.mockResolvedValueOnce(ok(mockFormWithAnswers)) // First call for getApplicationFormWithAnswers
				.mockResolvedValueOnce(err(new Error('Transaction failed'))); // Second call for the transaction

			const { submitApplication } = await import('./formResponseService');
			const result = await submitApplication(mockUserId, mockFormId, mockFormGroupId);

			expect(result.isErr()).toBe(true);
		});
	});

	describe('validation functions', () => {
		describe('validateTextAnswer', () => {
			it('should validate text length constraints', async () => {
				const { submitApplication } = await import('./formResponseService');

				// Test through submitApplication with text validation
				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [{ valueText: 'Short' }], // Too short
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.TEXT,
										minLength: 10,
										maxLength: 100
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error.message).toContain('at least 10 characters');
				}
			});

			it('should validate text max length constraints', async () => {
				const { submitApplication } = await import('./formResponseService');

				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [
										{
											valueText: 'This is a very long answer that exceeds the maximum length limit'
										}
									],
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.TEXT,
										minLength: 1,
										maxLength: 20
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error.message).toContain('no more than 20 characters');
				}
			});
		});

		describe('validateNumberAnswer', () => {
			it('should validate number min value constraints', async () => {
				const { submitApplication } = await import('./formResponseService');

				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [{ valueNumber: 5 }], // Below minimum
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.NUMBER,
										minValue: 10,
										maxValue: 100
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error.message).toContain('at least 10');
				}
			});

			it('should validate number max value constraints', async () => {
				const { submitApplication } = await import('./formResponseService');

				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [{ valueNumber: 150 }], // Above maximum
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.NUMBER,
										minValue: 1,
										maxValue: 100
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error.message).toContain('no more than 100');
				}
			});
		});

		describe('validateDateAnswer', () => {
			it('should validate date min constraints', async () => {
				const { submitApplication } = await import('./formResponseService');

				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [{ valueDate: new Date('2023-01-01') }], // Before min date
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.DATE,
										minDate: new Date('2024-01-01'),
										maxDate: null
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error.message).toContain('on or after');
				}
			});

			it('should validate date max constraints', async () => {
				const { submitApplication } = await import('./formResponseService');

				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [{ valueDate: new Date('2025-01-01') }], // After max date
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.DATE,
										minDate: null,
										maxDate: new Date('2024-12-31')
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error.message).toContain('on or before');
				}
			});
		});

		describe('validateChoiceAnswer', () => {
			it('should validate choice questions with selected options', async () => {
				const { submitApplication } = await import('./formResponseService');

				const mockApplicationResponse = { id: 'app-123' };
				const mockFormWithAnswers = {
					sections: [
						{
							questions: [
								{
									required: true,
									Answer: [
										{
											selectedOptions: [{ optionId: 'option-1' }]
										}
									],
									questionVersion: {
										prompt: 'Test question?',
										type: QuestionType.MULTIPLE_CHOICE
									}
								}
							]
						}
					]
				};

				(mockPrisma.applicationResponse.findUnique as any).mockResolvedValue(
					mockApplicationResponse
				);
				(mockPrismaResult as any).mockResolvedValue(ok(mockFormWithAnswers));
				(mockPrisma.$transaction as any).mockImplementation(async (callback: any) => {
					return await callback(mockPrisma);
				});

				const result = await submitApplication('user-123', 'form-123', 'group-123');
				expect(result.isOk()).toBe(true);
			});
		});
	});

	describe('saveApplicationQuestion', () => {
		const mockUserId = 'user-123';
		const mockFormId = 'form-123';
		const mockQuestionVersionId = 'question-123';

		it('should save text question successfully', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.TEXT,
					options: []
				},
				section: { id: 'section-1' }
			};

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);
			(mockPrisma.answer.upsert as any).mockResolvedValue({});
			(mockPrisma.applicationResponse.update as any).mockResolvedValue({});

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(
				mockUserId,
				mockFormId,
				mockQuestionVersionId,
				'Test answer'
			);

			expect(result.isOk()).toBe(true);
		});

		it('should save number question successfully', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.NUMBER,
					options: []
				},
				section: { id: 'section-1' }
			};

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);
			(mockPrisma.answer.upsert as any).mockResolvedValue({});
			(mockPrisma.applicationResponse.update as any).mockResolvedValue({});

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(
				mockUserId,
				mockFormId,
				mockQuestionVersionId,
				42
			);

			expect(result.isOk()).toBe(true);
		});

		it('should save date question successfully', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.DATE,
					options: []
				},
				section: { id: 'section-1' }
			};

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);
			(mockPrisma.answer.upsert as any).mockResolvedValue({});
			(mockPrisma.applicationResponse.update as any).mockResolvedValue({});

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(
				mockUserId,
				mockFormId,
				mockQuestionVersionId,
				'2024-01-01'
			);

			expect(result.isOk()).toBe(true);
		});

		it('should save multiple choice question successfully', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.MULTIPLE_CHOICE,
					options: [{ id: 'option-1' }, { id: 'option-2' }]
				},
				section: { id: 'section-1' }
			};

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);
			(mockPrisma.answer.upsert as any).mockResolvedValue({});
			(mockPrisma.applicationResponse.update as any).mockResolvedValue({});

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(mockUserId, mockFormId, mockQuestionVersionId, [
				'option-1',
				'option-2'
			]);

			expect(result.isOk()).toBe(true);
		});

		it('should handle invalid option IDs', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.MULTIPLE_CHOICE,
					options: [{ id: 'option-1' }] // Only one valid option
				},
				section: { id: 'section-1' }
			};

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(mockUserId, mockFormId, mockQuestionVersionId, [
				'option-1',
				'invalid-option'
			]);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe('Invalid option selected');
			}
		});

		it('should handle file upload validation', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.FILE_UPLOAD,
					options: []
				},
				section: { id: 'section-1' }
			};

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);
			(mockPrisma.fileUpload.findUnique as any).mockResolvedValue(null); // File doesn't exist

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(
				mockUserId,
				mockFormId,
				mockQuestionVersionId,
				'non-existent-file'
			);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe('File not found');
			}
		});

		it('should handle file upload cleanup for deleted files', async () => {
			const mockApplication = { id: 'app-123' };
			const mockQuestionLink = {
				questionVersion: {
					id: 'version-1',
					type: QuestionType.FILE_UPLOAD,
					options: []
				},
				section: { id: 'section-1' }
			};
			const mockExistingAnswer = { fileUploadId: 'old-file-123' };

			(mockPrisma.applicationResponse.upsert as any).mockResolvedValue(mockApplication);
			(mockPrisma.questionLinkPublished.findFirstOrThrow as any).mockResolvedValue(
				mockQuestionLink
			);
			(mockPrisma.answer.findUnique as any).mockResolvedValue(mockExistingAnswer);

			// Mock file upload checks - the new file must exist for validation to pass
			(mockPrisma.fileUpload.findUnique as any)
				.mockResolvedValueOnce({ id: 'new-file-123' }) // New file exists (validation check)
				.mockResolvedValueOnce(null); // Old file doesn't exist (cleanup check)

			(mockPrisma.answer.upsert as any).mockResolvedValue({});
			(mockPrisma.applicationResponse.update as any).mockResolvedValue({});

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(
				mockUserId,
				mockFormId,
				mockQuestionVersionId,
				'new-file-123'
			);

			expect(result.isOk()).toBe(true);

			// Verify that answer.update was called to clear the old file reference
			expect(mockPrisma.answer.update).toHaveBeenCalledWith({
				where: {
					applicationId_questionVersionId: {
						applicationId: 'app-123',
						questionVersionId: 'version-1'
					}
				},
				data: { fileUploadId: null }
			});
		});

		it('should handle errors gracefully', async () => {
			(mockPrisma.applicationResponse.upsert as any).mockRejectedValue(new Error('Database error'));

			const { saveApplicationQuestion } = await import('./formResponseService');
			const result = await saveApplicationQuestion(
				mockUserId,
				mockFormId,
				mockQuestionVersionId,
				'test'
			);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe('Error saving application response');
			}
		});
	});

	describe('getAllAvailableApplicationForms', () => {
		it('should return available forms successfully', async () => {
			const mockForms = [
				{
					id: 'form-1',
					active: true,
					archived: false,
					openDate: null,
					closeDate: null,
					responses: []
				}
			];

			(mockPrismaResult as any).mockResolvedValue(ok(mockForms));

			const { getAllAvailableApplicationForms } = await import('./formResponseService');
			const result = await getAllAvailableApplicationForms('user-123');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toEqual(mockForms);
			}
		});

		it('should handle prisma errors gracefully', async () => {
			(mockPrismaResult as any).mockResolvedValue(err(new Error('Database error')));

			const { getAllAvailableApplicationForms } = await import('./formResponseService');
			const result = await getAllAvailableApplicationForms('user-123');

			expect(result.isErr()).toBe(true);
		});
	});

	describe('checkApplicationReadOnly', () => {
		let checkApplicationReadOnly: any;

		beforeEach(async () => {
			const module = await import('./formResponseService');
			checkApplicationReadOnly = module.checkApplicationReadOnly;
		});

		it('should return read-only when form is submitted', () => {
			const result = checkApplicationReadOnly({
				status: 'SUBMITTED',
				form: {
					closeDate: null,
					openDate: null,
					active: true,
					archived: false
				}
			});

			expect(result.isReadOnly).toBe(true);
			expect(result.readOnlyMessage).toContain('submitted and is no longer editable');
		});

		it('should return read-only when form is archived', () => {
			const result = checkApplicationReadOnly({
				status: 'DRAFT',
				form: {
					closeDate: null,
					openDate: null,
					active: true,
					archived: true
				}
			});

			expect(result.isReadOnly).toBe(true);
			expect(result.readOnlyMessage).toContain('archived and is no longer available');
		});

		it('should return read-only when form is closed', () => {
			const result = checkApplicationReadOnly({
				status: 'DRAFT',
				form: {
					closeDate: new Date('2023-01-01'), // Past date
					openDate: null,
					active: true,
					archived: false
				}
			});

			expect(result.isReadOnly).toBe(true);
			expect(result.readOnlyMessage).toContain('no longer available');
		});

		it('should return read-only when form is disabled', () => {
			const result = checkApplicationReadOnly({
				status: 'DRAFT',
				form: {
					closeDate: null,
					openDate: null,
					active: false,
					archived: false
				}
			});

			expect(result.isReadOnly).toBe(true);
			expect(result.readOnlyMessage).toContain('currently disabled');
		});

		it('should return read-only when form is not yet open', () => {
			// Use a date that's definitely in the future
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year from now

			const result = checkApplicationReadOnly({
				status: 'DRAFT',
				form: {
					closeDate: null,
					openDate: futureDate,
					active: true,
					archived: false
				}
			});

			expect(result.isReadOnly).toBe(true);
			expect(result.readOnlyMessage).toContain('not yet available');
		});

		it('should return editable when form is valid', () => {
			const result = checkApplicationReadOnly({
				status: 'DRAFT',
				form: {
					closeDate: null,
					openDate: null,
					active: true,
					archived: false
				}
			});

			expect(result.isReadOnly).toBe(false);
			expect(result.readOnlyMessage).toBe('');
		});

		it('should handle date constraints correctly', () => {
			const now = new Date();
			const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
			const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

			const result = checkApplicationReadOnly({
				status: 'DRAFT',
				form: {
					closeDate: futureDate,
					openDate: pastDate,
					active: true,
					archived: false
				}
			});

			expect(result.isReadOnly).toBe(false);
			expect(result.readOnlyMessage).toBe('');
		});
	});
});
