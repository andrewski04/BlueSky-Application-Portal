import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma, prismaResult } from '../prisma';
import { AppError } from '$lib/utils/error';
import { ok, err } from '$lib/utils/error';

// Mock the prisma module
vi.mock('../prisma', () => ({
	prisma: {
		questionTemplate: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn()
		},
		questionVersion: {
			create: vi.fn(),
			count: vi.fn()
		},
		questionOptionGroup: {
			create: vi.fn()
		},
		questionOption: {
			createMany: vi.fn()
		},
		applicationFormDraft: {
			findUniqueOrThrow: vi.fn(),
			findUnique: vi.fn()
		},
		applicationFormPublished: {
			create: vi.fn()
		},
		formSectionPublished: {
			create: vi.fn()
		},
		questionLinkPublished: {
			create: vi.fn()
		},
		$transaction: vi.fn()
	},
	prismaResult: vi.fn()
}));

describe('FormService', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockPrismaResult = vi.mocked(prismaResult);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('publishFormFromDraft', () => {
		const mockDraftId = 'draft-123';
		const mockDraft = {
			id: mockDraftId,
			name: 'Test Form',
			description: 'Test form description',
			sections: [
				{
					id: 'section-1',
					name: 'Section 1',
					slug: 'section-1',
					description: 'Section 1 description',
					displayOrder: 1,
					colorScheme: 'blue',
					questions: [
						{
							id: 'link-1',
							displayOrder: 1,
							required: true,
							questionDraft: {
								id: 'draft-question-1',
								templateId: null,
								slug: 'test-question',
								prompt: 'Test question?',
								type: 'TEXT',
								minLength: 1,
								maxLength: 100,
								minValue: null,
								maxValue: null,
								minDate: null,
								maxDate: null,
								acceptedTypes: null,
								maxFileSizeBytes: null,
								options: []
							},
							questionVersion: null
						}
					]
				}
			]
		};

		it('should publish form from draft successfully', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(mockDraft);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockResolvedValue({
				id: 'published-link-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback: any) => {
				return await callback(mockPrisma);
			});

			// Mock the questionDraftToVersion function by mocking its dependencies
			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'template-1' });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap().publishedId).toBe('published-123');
			}
		});

		it('should return error when draft has no sections', async () => {
			const draftWithoutSections = { ...mockDraft, sections: [] };
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(
				draftWithoutSections
			);

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Form draft must have atleast one section');
			}
		});

		it('should handle library questions correctly', async () => {
			const draftWithLibraryQuestion = {
				...mockDraft,
				sections: [
					{
						...mockDraft.sections[0],
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: null,
								questionVersion: {
									id: 'library-version-1',
									templateId: 'template-1',
									version: 1,
									prompt: 'Library question?',
									type: 'TEXT'
								}
							}
						]
					}
				]
			};

			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(
				draftWithLibraryQuestion
			);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockResolvedValue({
				id: 'published-link-1'
			});
			(mockPrisma.$transaction as any).mockImplementation(async (callback: any) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(true);
			expect(mockPrisma.questionLinkPublished.create).toHaveBeenCalledWith({
				data: {
					sectionId: 'published-section-1',
					questionVersionId: 'library-version-1',
					displayOrder: 1,
					required: true
				}
			});
		});

		it('should handle questionDraftToVersion errors', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(mockDraft);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.$transaction as any).mockImplementation(async (callback: any) => {
				return await callback(mockPrisma);
			});

			// Mock questionDraftToVersion to fail
			(mockPrisma.questionTemplate.create as any).mockRejectedValue(
				new Error('Template creation failed')
			);

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
				expect(result.error.code).toBe('ERR_PUBLISH_FORM');
			}
		});

		it('should handle transaction errors', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(mockDraft);
			mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
				expect(result.error.code).toBe('ERR_PUBLISH_FORM');
			}
		});

		it('should handle missing question link data', async () => {
			const draftWithInvalidQuestion = {
				...mockDraft,
				sections: [
					{
						...mockDraft.sections[0],
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: null,
								questionVersion: null
							}
						]
					}
				]
			};

			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(
				draftWithInvalidQuestion
			);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle form section creation failure', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(mockDraft);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});

			// Mock the transaction to throw an error
			mockPrisma.$transaction.mockImplementation(async (callback: any) => {
				throw new Error('Section creation failed');
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle question link creation failure', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(mockDraft);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockRejectedValue(
				new Error('Question link creation failed')
			);

			// Mock the questionDraftToVersion function by mocking its dependencies
			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'template-1' });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle form with multiple sections and questions', async () => {
			const mockDraftWithMultipleSections = {
				...mockDraft,
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: {
									id: 'draft-question-1',
									templateId: null,
									slug: 'test-question-1',
									prompt: 'Test question 1?',
									type: 'TEXT',
									minLength: 1,
									maxLength: 100,
									minValue: null,
									maxValue: null,
									minDate: null,
									maxDate: null,
									acceptedTypes: null,
									maxFileSizeBytes: null,
									options: []
								},
								questionVersion: null
							}
						]
					},
					{
						id: 'section-2',
						name: 'Section 2',
						slug: 'section-2',
						description: 'Section 2 description',
						displayOrder: 2,
						colorScheme: 'red',
						questions: [
							{
								id: 'link-2',
								displayOrder: 1,
								required: false,
								questionDraft: null,
								questionVersion: {
									id: 'library-version-1',
									templateId: 'template-1',
									version: 1,
									prompt: 'Library question?',
									type: 'NUMBER'
								}
							}
						]
					}
				]
			};

			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(
				mockDraftWithMultipleSections
			);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any)
				.mockResolvedValueOnce({ id: 'published-section-1' })
				.mockResolvedValueOnce({ id: 'published-section-2' });
			(mockPrisma.questionLinkPublished.create as any)
				.mockResolvedValueOnce({ id: 'published-link-1' })
				.mockResolvedValueOnce({ id: 'published-link-2' });

			// Mock the questionDraftToVersion function by mocking its dependencies
			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'template-1' });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap().publishedId).toBe('published-123');
			}

			// Verify both sections were created
			expect(mockPrisma.formSectionPublished.create).toHaveBeenCalledTimes(2);
			expect(mockPrisma.questionLinkPublished.create).toHaveBeenCalledTimes(2);
		});

		it('should handle form with active parameter', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue(mockDraft);
			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockResolvedValue({
				id: 'published-link-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			// Mock the questionDraftToVersion function by mocking its dependencies
			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'template-1' });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId, { active: false });

			expect(result.isOk()).toBe(true);
			expect(mockPrisma.applicationFormPublished.create).toHaveBeenCalledWith({
				data: {
					name: 'Test Form',
					description: 'Test form description',
					active: false
				}
			});
		});

		it('should handle database connection errors', async () => {
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockRejectedValue(
				new Error('Database connection failed')
			);

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft(mockDraftId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});
	});

	describe('getFormDraftPreview', () => {
		const mockFormId = 'draft-123';
		const mockDraft = {
			id: mockFormId,
			name: 'Test Form',
			description: 'Test form description',
			sections: [
				{
					id: 'section-1',
					name: 'Section 1',
					slug: 'section-1',
					description: 'Section 1 description',
					displayOrder: 1,
					colorScheme: 'blue',
					questions: [
						{
							id: 'link-1',
							displayOrder: 1,
							required: true,
							questionDraft: {
								id: 'draft-question-1',
								prompt: 'Test question?',
								type: 'TEXT'
							},
							questionVersion: null
						}
					]
				}
			]
		};

		it('should return form draft preview successfully', async () => {
			(mockPrismaResult as any).mockResolvedValue(ok(mockDraft));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const preview = result.unwrap();
				expect(preview.adminName).toBe('Test Form');
				expect(preview.active).toBe(true);
				expect(preview.archived).toBe(false);
				expect(preview.sections).toHaveLength(1);
				expect(preview.sections[0].questions).toHaveLength(1);
			}
		});

		it('should return error when prismaResult fails', async () => {
			(mockPrismaResult as any).mockResolvedValue(err(new AppError('Database error')));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to fetch form draft');
			}
		});

		it('should return error when draft not found', async () => {
			(mockPrismaResult as any).mockResolvedValue(ok(null));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Form draft not found');
			}
		});

		it('should transform draft questions correctly', async () => {
			(mockPrismaResult as any).mockResolvedValue(ok(mockDraft));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const preview = result.unwrap();
				const question = preview.sections[0].questions[0];
				expect(question.questionVersionId).toBe('draft-question-1');
				expect(question.questionVersion.prompt).toBe('Test question?');
				expect(question.Answer).toEqual([]);
			}
		});

		it('should handle questions with existing questionVersion', async () => {
			const mockDraftWithVersion = {
				...mockDraft,
				sections: [
					{
						...mockDraft.sections[0],
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: null,
								questionVersion: {
									id: 'existing-version-1',
									prompt: 'Existing question?',
									type: 'TEXT'
								}
							}
						]
					}
				]
			};

			(mockPrismaResult as any).mockResolvedValue(ok(mockDraftWithVersion));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const preview = result.unwrap();
				const question = preview.sections[0].questions[0];
				expect(question.questionVersionId).toBe('existing-version-1');
				expect(question.questionVersion.prompt).toBe('Existing question?');
			}
		});

		it('should handle questions with neither draft nor version', async () => {
			const mockDraftWithoutQuestion = {
				...mockDraft,
				sections: [
					{
						...mockDraft.sections[0],
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: null,
								questionVersion: null
							}
						]
					}
				]
			};

			(mockPrismaResult as any).mockResolvedValue(ok(mockDraftWithoutQuestion));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const preview = result.unwrap();
				const question = preview.sections[0].questions[0];
				expect(question.questionVersionId).toBe('DraftQuestion');
				expect(question.questionVersion.prompt).toBeUndefined();
			}
		});

		it('should handle multiple sections with different question types', async () => {
			const mockDraftWithMultipleSections = {
				...mockDraft,
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: {
									id: 'draft-question-1',
									prompt: 'Test question 1?',
									type: 'TEXT'
								},
								questionVersion: null
							}
						]
					},
					{
						id: 'section-2',
						name: 'Section 2',
						slug: 'section-2',
						description: 'Section 2 description',
						displayOrder: 2,
						colorScheme: 'red',
						questions: [
							{
								id: 'link-2',
								displayOrder: 1,
								required: false,
								questionDraft: {
									id: 'draft-question-2',
									prompt: 'Test question 2?',
									type: 'NUMBER'
								},
								questionVersion: null
							}
						]
					}
				]
			};

			(mockPrismaResult as any).mockResolvedValue(ok(mockDraftWithMultipleSections));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const preview = result.unwrap();
				expect(preview.sections).toHaveLength(2);
				expect(preview.sections[0].colorScheme).toBe('blue');
				expect(preview.sections[1].colorScheme).toBe('red');
				expect(preview.sections[0].questions[0].questionVersion.prompt).toBe('Test question 1?');
				expect(preview.sections[1].questions[0].questionVersion.prompt).toBe('Test question 2?');
			}
		});

		it('should set correct default values for transformed form', async () => {
			(mockPrismaResult as any).mockResolvedValue(ok(mockDraft));

			const { getFormDraftPreview } = await import('./formService');
			const result = await getFormDraftPreview(mockFormId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const preview = result.unwrap();
				expect(preview.active).toBe(true);
				expect(preview.archived).toBe(false);
				expect(preview.closeDate).toBeNull();
				expect(preview.openDate).toBeNull();
				expect(preview.groupId).toBeNull();
				expect(preview.group).toBeNull();
				expect(preview.publishedAt).toBeInstanceOf(Date);
			}
		});
	});

	describe('questionDraftToVersion (helper function)', () => {
		it('should create new template when templateId is not provided', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: null,
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'template-1' });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockResolvedValue({
				id: 'published-link-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(true);
			expect(mockPrisma.questionTemplate.create).toHaveBeenCalledWith({
				data: {
					slug: 'test-question',
					displayName: 'Test question prompt',
					inLibrary: false
				}
			});
		});

		it('should reuse existing template when templateId is provided', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: 'existing-template-1',
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			(mockPrisma.questionTemplate.findUnique as any).mockResolvedValue({
				id: 'existing-template-1'
			});
			(mockPrisma.questionVersion.count as any).mockResolvedValue(1);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-2' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'existing-template-1' });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'existing-template-1' }));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockResolvedValue({
				id: 'published-link-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(true);
			expect(mockPrisma.questionTemplate.findUnique).toHaveBeenCalledWith({
				where: { id: 'existing-template-1' }
			});
			expect(mockPrisma.questionVersion.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					templateId: 'existing-template-1',
					version: 2
				})
			});
		});

		it('should handle template creation failure', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: null,
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			(mockPrisma.questionTemplate.create as any).mockRejectedValue(
				new Error('Template creation failed')
			);

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle template find failure', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: 'existing-template-1',
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(err(new Error('Template not found')));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle template with null value', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: 'existing-template-1',
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok(null));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle question version creation failure', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: null,
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockRejectedValue(
				new Error('Version creation failed')
			);

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle question template update failure', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: null,
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: []
			};

			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockRejectedValue(
				new Error('Template update failed')
			);

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to publish form');
			}
		});

		it('should handle questions with options correctly', async () => {
			const mockDraft = {
				id: 'draft-1',
				templateId: null,
				slug: 'test-question',
				prompt: 'Test question prompt',
				type: 'TEXT',
				minLength: 1,
				maxLength: 100,
				minValue: null,
				maxValue: null,
				minDate: null,
				maxDate: null,
				acceptedTypes: null,
				maxFileSizeBytes: null,
				options: [
					{
						id: 'option-1',
						text: 'Option 1',
						displayOrder: 1,
						questionOptionGroup: {
							id: 'group-1',
							text: 'Group 1'
						}
					},
					{
						id: 'option-2',
						text: 'Option 2',
						displayOrder: 2,
						questionOptionGroup: {
							id: 'group-2',
							text: 'Group 2'
						}
					}
				]
			};

			(mockPrisma.questionTemplate.create as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionVersion.count as any).mockResolvedValue(0);
			(mockPrisma.questionVersion.create as any).mockResolvedValue({ id: 'version-1' });
			(mockPrisma.questionTemplate.update as any).mockResolvedValue({ id: 'template-1' });
			(mockPrisma.questionOptionGroup.create as any).mockResolvedValue({ id: 'group-1' });
			(mockPrisma.questionOption.createMany as any).mockResolvedValue({ count: 2 });

			// Mock the prismaResult calls that questionDraftToVersion makes internally
			(mockPrismaResult as any).mockResolvedValue(ok({ id: 'template-1' }));

			// Test through publishFormFromDraft
			(mockPrisma.applicationFormDraft.findUniqueOrThrow as any).mockResolvedValue({
				id: 'draft-123',
				name: 'Test Form',
				description: 'Test form description',
				sections: [
					{
						id: 'section-1',
						name: 'Section 1',
						slug: 'section-1',
						description: 'Section 1 description',
						displayOrder: 1,
						colorScheme: 'blue',
						questions: [
							{
								id: 'link-1',
								displayOrder: 1,
								required: true,
								questionDraft: mockDraft,
								questionVersion: null
							}
						]
					}
				]
			});

			(mockPrisma.applicationFormPublished.create as any).mockResolvedValue({
				id: 'published-123'
			});
			(mockPrisma.formSectionPublished.create as any).mockResolvedValue({
				id: 'published-section-1'
			});
			(mockPrisma.questionLinkPublished.create as any).mockResolvedValue({
				id: 'published-link-1'
			});
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			const { publishFormFromDraft } = await import('./formService');
			const result = await publishFormFromDraft('draft-123');

			expect(result.isOk()).toBe(true);
		});
	});
});
