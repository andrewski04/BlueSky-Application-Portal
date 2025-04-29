import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSessionToken } from './session';
import { prisma } from '$lib/server/prisma';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
// Mock the prisma client
vi.mock('$lib/server/prisma', () => ({
	prisma: {
		session: {
			findUnique: vi.fn(),
			delete: vi.fn(),
			update: vi.fn()
		}
	}
}));

describe('Auth Session', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
	});

	describe('validateSessionToken', () => {
		it('should return null for invalid token', async () => {
			// Mock implementation for an invalid token
			vi.mocked(prisma.session.findUnique).mockResolvedValue(null);

			const result = await validateSessionToken('invalid-token');

			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
			// Check that findUnique was called with the hashed token
			expect(prisma.session.findUnique).toHaveBeenCalled();
			// We can't easily test the exact hashed value, but we can verify the structure
			expect(prisma.session.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { hashedToken: expect.any(String) },
					include: { user: true }
				})
			);
		});

		it('should return null for expired token', async () => {
			// Mock implementation for an expired token
			const expiredDate = new Date(Date.now() - 1000); // Expired 1 second ago

			const token = 'secret_token';
			const hashedToken = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

			vi.mocked(prisma.session.findUnique).mockResolvedValue({
				hashedToken: hashedToken,
				userId: '123',
				expiresAt: expiredDate,
				createdAt: new Date()
			});

			const result = await validateSessionToken(token);

			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
			expect(prisma.session.delete).toHaveBeenCalledWith({
				where: { hashedToken: hashedToken }
			});
		});

		it('should return session and user for valid token', async () => {
			// Mock implementation for a valid token
			const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

			const mockUser = {
				id: '123',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				role: 'USER'
			};

			const mockSessionWithUser = {
				hashedToken: 'hashed-token',
				userId: '123',
				expiresAt: futureDate,
				createdAt: new Date(),
				user: mockUser
			};

			vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSessionWithUser);

			const result = await validateSessionToken('valid-token');

			const { user, ...session } = mockSessionWithUser;
			expect(result.session).toEqual(session);
			expect(result.user).toEqual(user);
		});

		it('should extend expiration for tokens nearing expiration', async () => {
			// Mock implementation for a token nearing expiration
			const nearingExpirationDate = new Date(
				Date.now() + 1000 * 60 * 60 * 6 // 6 hours until expiry
			);

			const mockUser = {
				id: '123',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				role: 'USER'
			};

			const mockSessionWithUser = {
				hashedToken: 'hashed-token',
				userId: '123',
				expiresAt: nearingExpirationDate,
				createdAt: new Date(),
				user: mockUser
			};

			vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSessionWithUser);
			vi.mocked(prisma.session.update).mockResolvedValue({
				...mockSessionWithUser,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
			});

			const result = await validateSessionToken('nearing-expiration-token');

			expect(result.session).toEqual(
				expect.objectContaining({
					hashedToken: 'hashed-token',
					userId: '123'
				})
			);
			expect(result.user).toEqual(mockUser);
			expect(prisma.session.update).toHaveBeenCalledWith({
				where: { hashedToken: 'hashed-token' },
				data: { expiresAt: expect.any(Date) }
			});
		});
	});
});
