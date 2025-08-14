import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createExampleForm } from './exampleForm';
import { prisma } from '$lib/server/prisma';

// Mock Prisma
vi.mock('$lib/server/prisma', () => ({
	prisma: {
		questionOptionGroupDraft: {
			create: vi.fn()
		},
		applicationFormDraft: {
			create: vi.fn()
		}
	},
	prismaResult: vi.fn((promise) => promise)
}));

describe('ExampleForm', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockPrismaResult = vi.mocked(prisma.prismaResult);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('createExampleForm', () => {
		it('should create example form with all required components', async () => {
			// Mock option group creation
			const mockOptionGroups = [
				{ id: 'group1', text: 'Professional maturity', displayOrder: 0 },
				{ id: 'group2', text: 'Ability to self-assess and seek support', displayOrder: 1 },
				{ id: 'group3', text: 'Enthusiasm for the field', displayOrder: 2 },
				{ id: 'group4', text: 'Interpersonal skills/relationship building', displayOrder: 3 },
				{ id: 'group5', text: 'Demonstrated interest in and ability to lead', displayOrder: 4 },
				{ id: 'group6', text: 'Persistence through adversity', displayOrder: 5 }
			];

			mockPrisma.questionOptionGroupDraft.create
				.mockResolvedValueOnce(mockOptionGroups[0])
				.mockResolvedValueOnce(mockOptionGroups[1])
				.mockResolvedValueOnce(mockOptionGroups[2])
				.mockResolvedValueOnce(mockOptionGroups[3])
				.mockResolvedValueOnce(mockOptionGroups[4])
				.mockResolvedValueOnce(mockOptionGroups[5]);

			// Mock form creation
			const mockForm = {
				id: 'form123',
				name: 'BlueSky Institute Application Form',
				description:
					'Complete application form for the BlueSky Institute accelerated computing degree program. This form evaluates your qualifications, personal qualities, and readiness for an intensive academic program.',
				sections: []
			};

			mockPrisma.applicationFormDraft.create.mockResolvedValue(mockForm);

			const result = await createExampleForm();

			// Verify option groups were created
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenCalledTimes(6);
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenNthCalledWith(1, {
				data: {
					text: 'Professional maturity',
					displayOrder: 0
				}
			});
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenNthCalledWith(2, {
				data: {
					text: 'Ability to self-assess and seek support',
					displayOrder: 1
				}
			});
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenNthCalledWith(3, {
				data: {
					text: 'Enthusiasm for the field',
					displayOrder: 2
				}
			});
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenNthCalledWith(4, {
				data: {
					text: 'Interpersonal skills/relationship building',
					displayOrder: 3
				}
			});
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenNthCalledWith(5, {
				data: {
					text: 'Demonstrated interest in and ability to lead',
					displayOrder: 4
				}
			});
			expect(mockPrisma.questionOptionGroupDraft.create).toHaveBeenNthCalledWith(6, {
				data: {
					text: 'Persistence through adversity',
					displayOrder: 5
				}
			});

			// Verify form was created
			expect(mockPrisma.applicationFormDraft.create).toHaveBeenCalledWith({
				data: {
					name: 'BlueSky Institute Application Form',
					description:
						'Complete application form for the BlueSky Institute accelerated computing degree program. This form evaluates your qualifications, personal qualities, and readiness for an intensive academic program.',
					sections: {
						create: expect.arrayContaining([
							expect.objectContaining({
								slug: 'personal-information',
								name: 'Personal Information',
								description:
									'Basic contact and eligibility information required for program consideration.',
								displayOrder: 0,
								colorScheme: 'BLUE',
								questions: {
									create: expect.arrayContaining([
										expect.objectContaining({
											displayOrder: 0,
											required: true,
											questionDraft: {
												create: expect.objectContaining({
													slug: 'contact-permission',
													type: 'MULTIPLE_CHOICE',
													prompt:
														'Can ETSU and its affiliates contact you via your Email Address or Phone Number?',
													options: {
														create: expect.arrayContaining([
															{ slug: 'yes', text: 'Yes', displayOrder: 0 },
															{ slug: 'no', text: 'No', displayOrder: 1 }
														])
													}
												})
											}
										})
									])
								}
							})
						])
					}
				}
			});

			expect(result).toEqual(mockForm);
		});

		it('should handle errors during option group creation', async () => {
			mockPrisma.questionOptionGroupDraft.create.mockRejectedValue(new Error('Database error'));

			await expect(createExampleForm()).rejects.toThrow('Database error');
		});

		it('should handle errors during form creation', async () => {
			// Mock successful option group creation
			const mockOptionGroups = [{ id: 'group1', text: 'Professional maturity', displayOrder: 0 }];

			mockPrisma.questionOptionGroupDraft.create.mockResolvedValue(mockOptionGroups[0]);
			mockPrisma.applicationFormDraft.create.mockRejectedValue(new Error('Form creation failed'));

			await expect(createExampleForm()).rejects.toThrow('Form creation failed');
		});
	});
});
