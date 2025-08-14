import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma, prismaResult } from '$lib/server/prisma';
import type { User, Session } from '@prisma/client';

// Mock dependencies
vi.mock('$lib/server/prisma', () => ({
	prisma: {
		session: {
			create: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn()
		}
	},
	prismaResult: vi.fn()
}));

// Mock crypto and encoding functions
vi.mock('crypto', () => ({
	getRandomValues: vi.fn()
}));

vi.mock('@oslojs/encoding', () => ({
	encodeBase32LowerCaseNoPadding: vi.fn(),
	encodeHexLowerCase: vi.fn()
}));

vi.mock('@oslojs/crypto/sha2', () => ({
	sha256: vi.fn()
}));

describe('Auth Session', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockPrismaResult = vi.mocked(prismaResult);

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset Date.now to a fixed timestamp
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('createSession', () => {
		const mockUserId = 'user123';
		const mockToken = 'session-token-123';
		const mockHashedToken = 'hashed-session-token-456';

		beforeEach(async () => {
			// Mock the crypto and encoding functions
			const crypto = await import('crypto');
			const encodeBase32LowerCaseNoPadding = await import('@oslojs/encoding');
			const encodeHexLowerCase = await import('@oslojs/encoding');
			const sha256 = await import('@oslojs/crypto/sha2');

			vi.mocked(crypto.getRandomValues).mockImplementation((array) => {
				// Fill with some predictable values
				for (let i = 0; i < array.length; i++) {
					array[i] = i % 256;
				}
				return array;
			});
			vi.mocked(encodeBase32LowerCaseNoPadding.encodeBase32LowerCaseNoPadding).mockReturnValue(
				mockToken
			);
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedToken);
			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
		});

		it('should create session successfully', async () => {
			const mockSession = {
				id: 'session123',
				hashedToken: mockHashedToken,
				userId: mockUserId,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
				createdAt: new Date(Date.now())
			};

			(mockPrisma.session.create as any).mockResolvedValue(mockSession);

			const { createSession } = await import('./session');
			const result = await createSession(mockUserId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap().token).toBe(mockToken);
				expect(result.unwrap().session).toEqual(
					expect.objectContaining({
						hashedToken: mockHashedToken,
						userId: mockUserId,
						expiresAt: expect.any(Date),
						createdAt: expect.any(Date)
					})
				);
			}

			expect(mockPrisma.session.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					hashedToken: mockHashedToken,
					userId: mockUserId,
					expiresAt: expect.any(Date),
					createdAt: expect.any(Date)
				})
			});
		});

		it('should return error when session creation fails', async () => {
			(mockPrisma.session.create as any).mockRejectedValue(new Error('Database error'));

			const { createSession } = await import('./session');
			const result = await createSession(mockUserId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Error creating session');
				expect(result.error.code).toBe('ERR_CREATE_SESSION');
			}
		});
	});

	describe('validateSessionToken', () => {
		const mockToken = 'session-token-123';
		const mockHashedToken = 'hashed-session-token-456';

		beforeEach(async () => {
			// Mock the encoding and hashing functions
			const encodeHexLowerCase = await import('@oslojs/encoding');
			const sha256 = await import('@oslojs/crypto/sha2');

			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedToken);
			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
		});

		it('should return null for invalid token', async () => {
			mockPrismaResult.mockResolvedValue({ isErr: () => true, isOk: () => false } as any);

			const { validateSessionToken } = await import('./session');
			const result = await validateSessionToken(mockToken);

			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
		});

		it('should return null for expired token', async () => {
			const mockSession = {
				id: 'session123',
				hashedToken: mockHashedToken,
				userId: 'user123',
				expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
			};

			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe'
			};

			mockPrismaResult.mockResolvedValue({
				isErr: () => false,
				isOk: () => true,
				value: { ...mockSession, user: mockUser }
			} as any);

			(mockPrisma.session.delete as any).mockResolvedValue({});

			const { validateSessionToken } = await import('./session');
			const result = await validateSessionToken(mockToken);

			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
			expect(mockPrisma.session.delete).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken }
			});
		});

		it('should return session and user for valid token', async () => {
			const mockSession = {
				id: 'session123',
				hashedToken: mockHashedToken,
				userId: 'user123',
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
				createdAt: new Date(Date.now() - 1000 * 60 * 60)
			};

			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe'
			};

			mockPrismaResult.mockResolvedValue({
				isErr: () => false,
				isOk: () => true,
				value: { ...mockSession, user: mockUser }
			} as any);

			const { validateSessionToken } = await import('./session');
			const result = await validateSessionToken(mockToken);

			expect(result.session).toEqual(mockSession);
			expect(result.user).toEqual(mockUser);
		});

		it('should extend expiration for tokens nearing expiration', async () => {
			const mockSession = {
				id: 'session123',
				hashedToken: mockHashedToken,
				userId: 'user123',
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now (within 12 hours)
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
			};

			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe'
			};

			mockPrismaResult.mockResolvedValue({
				isErr: () => false,
				isOk: () => true,
				value: { ...mockSession, user: mockUser }
			} as any);

			(mockPrisma.session.update as any).mockResolvedValue({});

			const { validateSessionToken } = await import('./session');
			const result = await validateSessionToken(mockToken);

			expect(result.session).toBeDefined();
			expect(result.user).toEqual(mockUser);
			expect(mockPrisma.session.update).toHaveBeenCalledWith({
				where: { hashedToken: mockSession.hashedToken },
				data: { expiresAt: expect.any(Date) }
			});
		});
	});

	describe('invalidateSession', () => {
		const mockHashedToken = 'hashed-session-token-123';

		it('should invalidate specific session', async () => {
			(mockPrisma.session.delete as any).mockResolvedValue({});

			const { invalidateSession } = await import('./session');
			await invalidateSession(mockHashedToken, true); // true means already hashed

			expect(mockPrisma.session.delete).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken }
			});
		});

		it('should hash raw token before invalidating', async () => {
			const mockRawToken = 'raw-session-token';
			const mockHashedToken = 'hashed-raw-session-token';

			// Mock the hashing functions
			const encodeHexLowerCase = await import('@oslojs/encoding');
			const sha256 = await import('@oslojs/crypto/sha2');

			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedToken);

			(mockPrisma.session.delete as any).mockResolvedValue({});

			const { invalidateSession } = await import('./session');
			await invalidateSession(mockRawToken, false); // false means raw token

			expect(mockPrisma.session.delete).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken }
			});
		});
	});

	describe('invalidateUserSessions', () => {
		const mockUserId = 'user123';

		it('should invalidate all sessions for user', async () => {
			(mockPrisma.session.deleteMany as any).mockResolvedValue({ count: 2 });

			const { invalidateUserSessions } = await import('./session');
			await invalidateUserSessions(mockUserId);

			expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
				where: { userId: mockUserId }
			});
		});
	});

	describe('setSessionTokenCookie', () => {
		const mockToken = 'session-token-123';
		const mockExpiresAt = new Date('2023-01-02T00:00:00Z');

		it('should set session token cookie with correct options', async () => {
			const mockEvent = {
				cookies: {
					set: vi.fn()
				}
			};

			const { setSessionTokenCookie } = await import('./session');
			setSessionTokenCookie(mockEvent, mockToken, mockExpiresAt);

			expect(mockEvent.cookies.set).toHaveBeenCalledWith('session', mockToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: false, // NODE_ENV is not production in test
				expires: mockExpiresAt
			});
		});

		it('should set secure flag in production environment', async () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const mockEvent = {
				cookies: {
					set: vi.fn()
				}
			};

			const { setSessionTokenCookie } = await import('./session');
			setSessionTokenCookie(mockEvent, mockToken, mockExpiresAt);

			expect(mockEvent.cookies.set).toHaveBeenCalledWith('session', mockToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: true, // NODE_ENV is production
				expires: mockExpiresAt
			});

			// Restore original environment
			process.env.NODE_ENV = originalEnv;
		});
	});

	describe('deleteSessionTokenCookie', () => {
		it('should delete session token cookie', async () => {
			const mockEvent = {
				cookies: {
					delete: vi.fn()
				}
			};

			const { deleteSessionTokenCookie } = await import('./session');
			deleteSessionTokenCookie(mockEvent);

			expect(mockEvent.cookies.delete).toHaveBeenCalledWith('session', { path: '/' });
		});
	});

	describe('getSessionTokenCookie', () => {
		it('should get session token from cookie', async () => {
			const mockToken = 'session-token-123';
			const mockEvent = {
				cookies: {
					get: vi.fn().mockReturnValue(mockToken)
				}
			};

			const { getSessionTokenCookie } = await import('./session');
			const result = getSessionTokenCookie(mockEvent);

			expect(mockEvent.cookies.get).toHaveBeenCalledWith('session');
			expect(result).toBe(mockToken);
		});

		it('should return undefined when no session cookie exists', async () => {
			const mockEvent = {
				cookies: {
					get: vi.fn().mockReturnValue(undefined)
				}
			};

			const { getSessionTokenCookie } = await import('./session');
			const result = getSessionTokenCookie(mockEvent);

			expect(result).toBeUndefined();
		});
	});
});
