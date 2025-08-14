import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { findUserByEmail, createUserIfNotExists, userSetupByUserId } from './user';
import { prisma } from '$lib/server/prisma';
import { validateEmail } from '$lib/utils/validation';
import { AppError } from '$lib/utils/error';

// Mock dependencies
vi.mock('$lib/server/prisma', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn()
		}
	}
}));

vi.mock('$lib/utils/validation', () => ({
	validateEmail: vi.fn()
}));

describe('User', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockValidateEmail = vi.mocked(validateEmail);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('findUserByEmail', () => {
		it('should find user by email', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe'
			};

			mockPrisma.user.findUnique.mockResolvedValue(mockUser);

			const result = await findUserByEmail('test@example.com');

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' }
			});
			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await findUserByEmail('nonexistent@example.com');

			expect(result).toBeNull();
		});
	});

	describe('createUserIfNotExists', () => {
		it('should create new user when user does not exist', async () => {
			const mockUser = {
				id: 'user123',
				email: 'new@example.com',
				firstName: null,
				lastName: null
			};

			mockValidateEmail.mockReturnValue({ isOk: () => true });
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.user.create.mockResolvedValue(mockUser);

			const result = await createUserIfNotExists('new@example.com');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap().user).toEqual(mockUser);
			}

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'new@example.com' }
			});
			expect(mockPrisma.user.create).toHaveBeenCalledWith({
				data: { email: 'new@example.com' }
			});
		});

		it('should return existing user when user already exists', async () => {
			const existingUser = {
				id: 'user123',
				email: 'existing@example.com',
				firstName: 'John',
				lastName: 'Doe'
			};

			mockValidateEmail.mockReturnValue({ isOk: () => true });
			mockPrisma.user.findUnique.mockResolvedValue(existingUser);

			const result = await createUserIfNotExists('existing@example.com');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap().user).toEqual(existingUser);
			}

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'existing@example.com' }
			});
			expect(mockPrisma.user.create).not.toHaveBeenCalled();
		});

		it('should return error for invalid email', async () => {
			mockValidateEmail.mockReturnValue({ isOk: () => false });

			const result = await createUserIfNotExists('invalid-email');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Invalid email');
				expect(result.error.code).toBe('ERR_INVALID_EMAIL');
			}
		});

		it('should return error for empty email', async () => {
			mockValidateEmail.mockReturnValue({ isOk: () => false });

			const result = await createUserIfNotExists('');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Invalid email');
				expect(result.error.code).toBe('ERR_INVALID_EMAIL');
			}
		});

		it('should throw error when database operation fails', async () => {
			mockValidateEmail.mockReturnValue({ isOk: () => true });
			mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

			await expect(createUserIfNotExists('test@example.com')).rejects.toThrow('Database error');
		});
	});

	describe('userSetupByUserId', () => {
		const mockUserId = 'user123';

		it('should update user profile successfully', async () => {
			mockPrisma.user.update.mockResolvedValue({} as any);

			const result = await userSetupByUserId(
				mockUserId,
				'John',
				'Doe',
				true,
				'john.doe@etsu.edu',
				'E12345678',
				'555-123-4567'
			);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toBe(true);
			}

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: mockUserId },
				data: {
					firstName: 'John',
					lastName: 'Doe',
					etsuApplicationComplete: true,
					etsuEmail: 'john.doe@etsu.edu',
					etsuENumber: 'E12345678',
					phoneNumber: '555-123-4567',
					isSetup: true
				}
			});
		});

		it('should trim whitespace from input fields', async () => {
			mockPrisma.user.update.mockResolvedValue({} as any);

			const result = await userSetupByUserId(
				mockUserId,
				'  John  ',
				'  Doe  ',
				false,
				'  john.doe@etsu.edu  ',
				'  E12345678  ',
				'  555-123-4567  '
			);

			expect(result.isOk()).toBe(true);

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: mockUserId },
				data: {
					firstName: 'John',
					lastName: 'Doe',
					etsuApplicationComplete: false,
					etsuEmail: 'john.doe@etsu.edu',
					etsuENumber: 'E12345678',
					phoneNumber: '555-123-4567',
					isSetup: true
				}
			});
		});

		it('should handle optional fields as null when not provided', async () => {
			mockPrisma.user.update.mockResolvedValue({} as any);

			const result = await userSetupByUserId(mockUserId, 'John', 'Doe');

			expect(result.isOk()).toBe(true);

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: mockUserId },
				data: {
					firstName: 'John',
					lastName: 'Doe',
					etsuApplicationComplete: false,
					etsuEmail: null,
					etsuENumber: null,
					phoneNumber: null,
					isSetup: true
				}
			});
		});

		it('should return error when first name is missing', async () => {
			const result = await userSetupByUserId(mockUserId, '', 'Doe');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('First name is required');
				expect(result.error.code).toBe('ERR_FIRST_NAME_REQUIRED');
			}

			expect(mockPrisma.user.update).not.toHaveBeenCalled();
		});

		it('should return error when first name is only whitespace', async () => {
			const result = await userSetupByUserId(mockUserId, '   ', 'Doe');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('First name is required');
				expect(result.error.code).toBe('ERR_FIRST_NAME_REQUIRED');
			}
		});

		it('should return error when last name is missing', async () => {
			const result = await userSetupByUserId(mockUserId, 'John', '');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Last name is required');
				expect(result.error.code).toBe('ERR_LAST_NAME_REQUIRED');
			}

			expect(mockPrisma.user.update).not.toHaveBeenCalled();
		});

		it('should return error when last name is only whitespace', async () => {
			const result = await userSetupByUserId(mockUserId, 'John', '   ');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Last name is required');
				expect(result.error.code).toBe('ERR_LAST_NAME_REQUIRED');
			}
		});

		it('should return error when database update fails', async () => {
			mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

			const result = await userSetupByUserId(mockUserId, 'John', 'Doe');

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Failed to update profile');
				expect(result.error.code).toBe('ERR_UPDATE_PROFILE');
			}
		});
	});
});
