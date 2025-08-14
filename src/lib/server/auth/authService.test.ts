import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticateUserWithMagicToken } from './authService';
import { invalidateMagicToken } from './magicToken';
import { createUserIfNotExists } from './user';
import { createSession } from './session';
import { AppError, ok, err } from '$lib/utils/error';
import { UserRole } from '@prisma/client';

// Mock dependencies
vi.mock('./magicToken', () => ({
	invalidateMagicToken: vi.fn()
}));

vi.mock('./user', () => ({
	createUserIfNotExists: vi.fn()
}));

vi.mock('./session', () => ({
	createSession: vi.fn()
}));

describe('AuthService', () => {
	const mockInvalidateMagicToken = vi.mocked(invalidateMagicToken);
	const mockCreateUserIfNotExists = vi.mocked(createUserIfNotExists);
	const mockCreateSession = vi.mocked(createSession);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('authenticateUserWithMagicToken', () => {
		const mockUser = {
			id: 'user123',
			email: 'test@example.com',
			role: UserRole.USER,
			firstName: 'John',
			lastName: 'Doe',
			createdAt: new Date(),
			etsuApplicationComplete: false,
			etsuENumber: null,
			etsuEmail: null,
			phoneNumber: null,
			isAdmin: false,
			isSetup: true
		};

		const mockSession = {
			id: 'session123',
			hashedToken: 'hashed-token',
			userId: 'user123',
			expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
			createdAt: new Date()
		};

		const mockToken = 'session-token-123';

		it('should authenticate user successfully with default redirect', async () => {
			mockInvalidateMagicToken.mockResolvedValue(undefined);
			mockCreateUserIfNotExists.mockResolvedValue(ok({ user: mockUser }));
			mockCreateSession.mockResolvedValue(ok({ session: mockSession, token: mockToken }));

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const authResult = result.unwrap();
				expect(authResult.success).toBe(true);
				expect(authResult.redirectTo).toBe('/user/dashboard');
				expect(authResult.token).toBe(mockToken);
				expect(authResult.expiresAt).toEqual(mockSession.expiresAt);
			}

			expect(mockInvalidateMagicToken).toHaveBeenCalledWith('hashed-magic-token', true);
			expect(mockCreateUserIfNotExists).toHaveBeenCalledWith('test@example.com');
			expect(mockCreateSession).toHaveBeenCalledWith('user123');
		});

		it('should authenticate admin user with admin dashboard redirect', async () => {
			const adminUser = { ...mockUser, role: UserRole.ADMIN };
			mockInvalidateMagicToken.mockResolvedValue(undefined);
			mockCreateUserIfNotExists.mockResolvedValue(ok({ user: adminUser }));
			mockCreateSession.mockResolvedValue(ok({ session: mockSession, token: mockToken }));

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const authResult = result.unwrap();
				expect(authResult.success).toBe(true);
				expect(authResult.redirectTo).toBe('/admin/dashboard');
				expect(authResult.token).toBe(mockToken);
				expect(authResult.expiresAt).toEqual(mockSession.expiresAt);
			}
		});

		it('should use custom redirect URL when provided', async () => {
			mockInvalidateMagicToken.mockResolvedValue(undefined);
			mockCreateUserIfNotExists.mockResolvedValue(ok({ user: mockUser }));
			mockCreateSession.mockResolvedValue(ok({ session: mockSession, token: mockToken }));

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token',
				redirectTo: '/custom/dashboard'
			});

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				const authResult = result.unwrap();
				expect(authResult.success).toBe(true);
				expect(authResult.redirectTo).toBe('/custom/dashboard');
				expect(authResult.token).toBe(mockToken);
				expect(authResult.expiresAt).toEqual(mockSession.expiresAt);
			}
		});

		it('should handle magic token invalidation failure', async () => {
			const tokenError = new Error('Token invalidation failed');
			mockInvalidateMagicToken.mockRejectedValue(tokenError);

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Token invalidation failed');
				expect(result.error.code).toBe('ERR_AUTH_UNKNOWN');
			}
		});

		it('should handle user creation failure', async () => {
			const userError = new AppError('User creation failed', 'ERR_USER_CREATION');
			mockInvalidateMagicToken.mockResolvedValue(undefined);
			mockCreateUserIfNotExists.mockResolvedValue(err(userError));

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBe(userError);
			}
		});

		it('should handle session creation failure', async () => {
			const sessionError = new AppError('Session creation failed', 'ERR_SESSION_CREATION');
			mockInvalidateMagicToken.mockResolvedValue(undefined);
			mockCreateUserIfNotExists.mockResolvedValue(ok({ user: mockUser }));
			mockCreateSession.mockResolvedValue(err(sessionError));

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBe(sessionError);
			}
		});

		it('should handle unknown errors gracefully', async () => {
			const unknownError = new Error('Unknown error occurred');
			mockInvalidateMagicToken.mockRejectedValue(unknownError);

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Unknown error occurred');
				expect(result.error.code).toBe('ERR_AUTH_UNKNOWN');
			}
		});

		it('should handle non-Error objects gracefully', async () => {
			const nonErrorObject = 'String error';
			mockInvalidateMagicToken.mockRejectedValue(nonErrorObject);

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Unknown authentication error');
				expect(result.error.code).toBe('ERR_AUTH_UNKNOWN');
			}
		});

		it('should handle null errors gracefully', async () => {
			mockInvalidateMagicToken.mockRejectedValue(null);

			const result = await authenticateUserWithMagicToken({
				email: 'test@example.com',
				hashedMagicToken: 'hashed-magic-token'
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Unknown authentication error');
				expect(result.error.code).toBe('ERR_AUTH_UNKNOWN');
			}
		});
	});
});
