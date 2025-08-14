import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '$lib/server/prisma';
import { validateEmail } from '$lib/utils/validation';

// Mock dependencies
vi.mock('$lib/server/prisma', () => ({
	prisma: {
		magicToken: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findFirst: vi.fn(),
			deleteMany: vi.fn(),
			delete: vi.fn(),
			update: vi.fn()
		}
	}
}));

vi.mock('$lib/utils/validation', () => ({
	validateEmail: vi.fn()
}));

// Mock crypto and encoding functions at the module level
vi.mock('crypto', () => ({
	default: {
		randomBytes: vi.fn()
	}
}));

vi.mock('@oslojs/crypto/sha2', () => ({
	sha256: vi.fn()
}));

vi.mock('@oslojs/encoding', () => ({
	encodeHexLowerCase: vi.fn()
}));

describe('MagicToken', () => {
	const mockPrisma = vi.mocked(prisma);
	const mockValidateEmail = vi.mocked(validateEmail);

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

	describe('createMagicToken', () => {
		const mockEmail = 'test@example.com';
		const mockDeviceId = 'device123';
		const mockToken = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
		const mockHashedToken = 'hashed-token-456';

		beforeEach(async () => {
			// Get the mocked modules and set up their return values
			const crypto = await import('crypto');
			const sha256 = await import('@oslojs/crypto/sha2');
			const encodeHexLowerCase = await import('@oslojs/encoding');

			// Mock the crypto.randomBytes function to return a buffer that when converted to hex gives our mock token
			// Convert the mock token to a buffer - each hex character represents 4 bits, so 32 bytes = 64 hex chars
			const mockBuffer = Buffer.alloc(32);
			// Fill with a pattern that will give us a predictable hex string
			for (let i = 0; i < 32; i++) {
				mockBuffer[i] = i % 256;
			}
			vi.mocked(crypto.default.randomBytes).mockReturnValue(mockBuffer);
			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedToken);

			mockValidateEmail.mockReturnValue({ isOk: () => true } as any);
		});

		it('should create magic token successfully', async () => {
			(mockPrisma.magicToken.create as any).mockResolvedValue({});

			const { createMagicToken } = await import('./magicToken');
			const result = await createMagicToken(mockEmail, mockDeviceId);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap().token).toBe(mockToken);
			}

			expect(mockPrisma.magicToken.create).toHaveBeenCalledWith({
				data: {
					hashedToken: mockHashedToken,
					deviceId: mockDeviceId,
					email: mockEmail,
					expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
				}
			});
		});

		it('should invalidate existing tokens before creating new one', async () => {
			(mockPrisma.magicToken.create as any).mockResolvedValue({});

			const { createMagicToken } = await import('./magicToken');
			await createMagicToken(mockEmail, mockDeviceId);

			expect(mockPrisma.magicToken.deleteMany).toHaveBeenCalledWith({
				where: { email: mockEmail }
			});
		});

		it('should return error for invalid email', async () => {
			mockValidateEmail.mockReturnValue({ isOk: () => false } as any);

			const { createMagicToken } = await import('./magicToken');
			const result = await createMagicToken('invalid-email', mockDeviceId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Invalid email');
				expect(result.error.code).toBe('ERR_INVALID_EMAIL');
			}
		});

		it('should return error when token creation fails', async () => {
			(mockPrisma.magicToken.create as any).mockRejectedValue(new Error('Database error'));

			const { createMagicToken } = await import('./magicToken');
			const result = await createMagicToken(mockEmail, mockDeviceId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Error creating magic token');
				expect(result.error.code).toBe('ERR_CREATE_MAGIC_TOKEN');
			}
		});

		it('should return error when invalidation fails', async () => {
			(mockPrisma.magicToken.deleteMany as any).mockRejectedValue(new Error('Invalidation failed'));

			const { createMagicToken } = await import('./magicToken');
			const result = await createMagicToken(mockEmail, mockDeviceId);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Error creating magic token');
				expect(result.error.code).toBe('ERR_CREATE_MAGIC_TOKEN');
			}
		});
	});

	describe('findMagicTokenByToken', () => {
		const mockToken = 'test-token';
		const mockHashedToken = 'hashed-test-token';

		beforeEach(async () => {
			// Get the mocked modules and set up their return values
			const sha256 = await import('@oslojs/crypto/sha2');
			const encodeHexLowerCase = await import('@oslojs/encoding');

			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedToken);
		});

		it('should find valid magic token', async () => {
			const mockMagicToken = {
				id: 'token123',
				hashedToken: mockHashedToken,
				email: 'test@example.com',
				deviceId: 'device123',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
			};

			(mockPrisma.magicToken.findUnique as any).mockResolvedValue(mockMagicToken);

			const { findMagicTokenByToken } = await import('./magicToken');
			const result = await findMagicTokenByToken(mockToken);

			expect(mockPrisma.magicToken.findUnique).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken }
			});
			expect(result).toEqual(mockMagicToken);
		});

		it('should return null for expired token', async () => {
			const expiredToken = {
				id: 'token123',
				hashedToken: mockHashedToken,
				email: 'test@example.com',
				deviceId: 'device123',
				expiresAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
			};

			(mockPrisma.magicToken.findUnique as any).mockResolvedValue(expiredToken);

			const { findMagicTokenByToken } = await import('./magicToken');
			const result = await findMagicTokenByToken(mockToken);

			expect(result).toBeNull();
		});

		it('should return null for non-existent token', async () => {
			(mockPrisma.magicToken.findUnique as any).mockResolvedValue(null);

			const { findMagicTokenByToken } = await import('./magicToken');
			const result = await findMagicTokenByToken(mockToken);

			expect(result).toBeNull();
		});
	});

	describe('findActiveMagicTokenByEmail', () => {
		const mockEmail = 'test@example.com';

		it('should find active magic token', async () => {
			const mockMagicToken = {
				id: 'token123',
				hashedToken: 'hashed-token',
				email: mockEmail,
				deviceId: 'device123',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
			};

			(mockPrisma.magicToken.findFirst as any).mockResolvedValue(mockMagicToken);

			const { findActiveMagicTokenByEmail } = await import('./magicToken');
			const result = await findActiveMagicTokenByEmail(mockEmail);

			expect(mockPrisma.magicToken.findFirst).toHaveBeenCalledWith({
				where: {
					email: mockEmail,
					expiresAt: { gt: new Date() }
				}
			});
			expect(result).toEqual(mockMagicToken);
		});

		it('should return null when no active token found', async () => {
			(mockPrisma.magicToken.findFirst as any).mockResolvedValue(null);

			const { findActiveMagicTokenByEmail } = await import('./magicToken');
			const result = await findActiveMagicTokenByEmail(mockEmail);

			expect(result).toBeNull();
		});
	});

	describe('findMagicTokenByEmailAndOtp', () => {
		const mockEmail = 'test@example.com';
		const mockOtp = '123456';
		const mockHashedOtp = 'hashed-otp';

		beforeEach(async () => {
			// Get the mocked modules and set up their return values
			const sha256 = await import('@oslojs/crypto/sha2');
			const encodeHexLowerCase = await import('@oslojs/encoding');

			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedOtp);
		});

		it('should find magic token by email and OTP', async () => {
			const mockMagicToken = {
				id: 'token123',
				hashedToken: 'hashed-token',
				hashedOtp: mockHashedOtp,
				email: mockEmail,
				deviceId: 'device123',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
			};

			(mockPrisma.magicToken.findFirst as any).mockResolvedValue(mockMagicToken);

			const { findMagicTokenByEmailAndOtp } = await import('./magicToken');
			const result = await findMagicTokenByEmailAndOtp(mockEmail, mockOtp);

			expect(mockPrisma.magicToken.findFirst).toHaveBeenCalledWith({
				where: {
					email: mockEmail,
					hashedOtp: mockHashedOtp,
					expiresAt: { gt: new Date() }
				}
			});
			expect(result).toEqual(mockMagicToken);
		});

		it('should return null when no matching token found', async () => {
			(mockPrisma.magicToken.findFirst as any).mockResolvedValue(null);

			const { findMagicTokenByEmailAndOtp } = await import('./magicToken');
			const result = await findMagicTokenByEmailAndOtp(mockEmail, mockOtp);

			expect(result).toBeNull();
		});
	});

	describe('generateOtp', () => {
		const mockRawToken = 'raw-token-123';
		const mockHashedToken = 'hashed-token-456';
		const mockOtp = '123456';
		const mockHashedOtp = 'hashed-otp-789';

		beforeEach(async () => {
			// Get the mocked modules and set up their return values
			const crypto = await import('crypto');
			const sha256 = await import('@oslojs/crypto/sha2');
			const encodeHexLowerCase = await import('@oslojs/encoding');

			// Mock the crypto.randomBytes function to return a buffer that when converted gives 123456
			// 123456 = 0x1E240, so we need 3 bytes: [0x01, 0xE2, 0x40]
			vi.mocked(crypto.default.randomBytes).mockReturnValue(Buffer.from([0x01, 0xe2, 0x40]));

			// Mock the hashing functions to return predictable values
			// First call (for token) returns mockHashedToken, second call (for OTP) returns mockHashedOtp
			let callCount = 0;
			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockImplementation(() => {
				callCount++;
				return callCount === 1 ? mockHashedToken : mockHashedOtp;
			});
		});

		it('should generate OTP successfully for new token', async () => {
			(mockPrisma.magicToken.findUnique as any).mockResolvedValue(null);
			(mockPrisma.magicToken.update as any).mockResolvedValue({});

			const { generateOtp } = await import('./magicToken');
			const result = await generateOtp(mockRawToken);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.unwrap()).toBe(mockOtp);
			}

			expect(mockPrisma.magicToken.update).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken },
				data: { hashedOtp: mockHashedOtp }
			});
		});

		it('should return error when token already has OTP', async () => {
			const existingToken = {
				id: 'token123',
				hashedToken: mockHashedToken,
				hashedOtp: 'existing-otp',
				email: 'test@example.com',
				deviceId: 'device123',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000)
			};

			(mockPrisma.magicToken.findUnique as any).mockResolvedValue(existingToken);

			const { generateOtp } = await import('./magicToken');
			const result = await generateOtp(mockRawToken);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Token already used');
				expect(result.error.code).toBe('ERR_TOKEN_ALREADY_USED');
			}
		});

		it('should return error when database update fails', async () => {
			(mockPrisma.magicToken.findUnique as any).mockResolvedValue(null);
			(mockPrisma.magicToken.update as any).mockRejectedValue(new Error('Database error'));

			const { generateOtp } = await import('./magicToken');
			const result = await generateOtp(mockRawToken);

			expect(result.isOk()).toBe(false);
			if (!result.isOk()) {
				expect(result.error.message).toBe('Error generating OTP');
				expect(result.error.code).toBe('ERR_GENERATE_OTP');
			}
		});
	});

	describe('invalidateAllMagicTokens', () => {
		const mockEmail = 'test@example.com';

		it('should invalidate all magic tokens for email', async () => {
			(mockPrisma.magicToken.deleteMany as any).mockResolvedValue({ count: 2 });

			const { invalidateAllMagicTokens } = await import('./magicToken');
			await invalidateAllMagicTokens(mockEmail);

			expect(mockPrisma.magicToken.deleteMany).toHaveBeenCalledWith({
				where: { email: mockEmail }
			});
		});

		it('should handle case when no tokens exist', async () => {
			(mockPrisma.magicToken.deleteMany as any).mockResolvedValue({ count: 0 });

			const { invalidateAllMagicTokens } = await import('./magicToken');
			await invalidateAllMagicTokens(mockEmail);

			expect(mockPrisma.magicToken.deleteMany).toHaveBeenCalledWith({
				where: { email: mockEmail }
			});
		});
	});

	describe('invalidateMagicToken', () => {
		const mockHashedToken = 'hashed-token-123';

		it('should invalidate specific magic token', async () => {
			(mockPrisma.magicToken.delete as any).mockResolvedValue({});

			const { invalidateMagicToken } = await import('./magicToken');
			await invalidateMagicToken(mockHashedToken, true); // true means already hashed

			expect(mockPrisma.magicToken.delete).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken }
			});
		});

		it('should hash raw token before invalidating', async () => {
			const mockRawToken = 'raw-token';
			const mockHashedToken = 'hashed-raw-token';

			// Mock the hashing functions
			const sha256 = await import('@oslojs/crypto/sha2');
			const encodeHexLowerCase = await import('@oslojs/encoding');

			vi.mocked(sha256.sha256).mockReturnValue(new Uint8Array([1, 2, 3]));
			vi.mocked(encodeHexLowerCase.encodeHexLowerCase).mockReturnValue(mockHashedToken);

			(mockPrisma.magicToken.delete as any).mockResolvedValue({});

			const { invalidateMagicToken } = await import('./magicToken');
			await invalidateMagicToken(mockRawToken, false); // false means raw token

			expect(mockPrisma.magicToken.delete).toHaveBeenCalledWith({
				where: { hashedToken: mockHashedToken }
			});
		});

		it('should handle case when token does not exist', async () => {
			(mockPrisma.magicToken.delete as any).mockRejectedValue(new Error('Token not found'));

			const { invalidateMagicToken } = await import('./magicToken');
			await expect(invalidateMagicToken(mockHashedToken, true)).rejects.toThrow('Token not found');
		});
	});
});
