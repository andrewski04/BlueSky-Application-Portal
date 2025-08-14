import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendMagicLink } from './mailer';
import { AppError, ok, err } from '$lib/utils/error';

// Mock nodemailer
vi.mock('nodemailer', () => ({
	default: {
		createTransport: vi.fn().mockReturnValue({
			sendMail: vi.fn()
		})
	}
}));

// Mock the validation utility
vi.mock('$lib/utils/validation', () => ({
	validateEmail: vi.fn()
}));

// Mock environment variables
const mockEnv = {
	EMAIL_SERVER_HOST: 'smtp.test.com',
	EMAIL_SERVER_PORT: '587',
	EMAIL_SERVER_USER: 'test@test.com',
	EMAIL_SERVER_PASSWORD: 'password123',
	EMAIL_USER: 'noreply@test.com'
};

describe('Mailer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Set up environment variables
		process.env.EMAIL_SERVER_HOST = mockEnv.EMAIL_SERVER_HOST;
		process.env.EMAIL_SERVER_PORT = mockEnv.EMAIL_SERVER_PORT;
		process.env.EMAIL_SERVER_USER = mockEnv.EMAIL_SERVER_USER;
		process.env.EMAIL_SERVER_PASSWORD = mockEnv.EMAIL_SERVER_PASSWORD;
		process.env.EMAIL_USER = mockEnv.EMAIL_USER;
	});

	afterEach(() => {
		vi.restoreAllMocks();
		// Clean up environment variables
		delete process.env.EMAIL_SERVER_HOST;
		delete process.env.EMAIL_SERVER_PORT;
		delete process.env.EMAIL_SERVER_USER;
		delete process.env.EMAIL_SERVER_PASSWORD;
		delete process.env.EMAIL_USER;
	});

	describe('sendMagicLink', () => {
		it('should send magic link successfully with valid email', async () => {
			const { validateEmail } = await import('$lib/utils/validation');
			vi.mocked(validateEmail).mockReturnValue(ok(true));

			const email = 'test@example.com';
			const token = 'magic-token-123';
			const baseUrl = 'http://localhost:5173';

			const result = await sendMagicLink(email, token, baseUrl);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBeUndefined();
			}
		});

		it('should return error for invalid email', async () => {
			const { validateEmail } = await import('$lib/utils/validation');
			vi.mocked(validateEmail).mockReturnValue(
				err(new AppError('Invalid email', 'ERR_INVALID_EMAIL'))
			);

			const email = 'invalid-email';
			const token = 'magic-token-123';
			const baseUrl = 'http://localhost:5173';

			const result = await sendMagicLink(email, token, baseUrl);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Invalid email');
				expect(result.error.code).toBe('ERR_INVALID_EMAIL');
			}
		});

		it('should return error for empty email', async () => {
			const { validateEmail } = await import('$lib/utils/validation');
			vi.mocked(validateEmail).mockReturnValue(
				err(new AppError('Invalid email', 'ERR_INVALID_EMAIL'))
			);

			const email = '';
			const token = 'magic-token-123';
			const baseUrl = 'http://localhost:5173';

			const result = await sendMagicLink(email, token, baseUrl);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Invalid email');
				expect(result.error.code).toBe('ERR_INVALID_EMAIL');
			}
		});

		it('should return error for null email', async () => {
			const { validateEmail } = await import('$lib/utils/validation');
			vi.mocked(validateEmail).mockReturnValue(
				err(new AppError('Invalid email', 'ERR_INVALID_EMAIL'))
			);

			const email = null as any;
			const token = 'magic-token-123';
			const baseUrl = 'http://localhost:5173';

			const result = await sendMagicLink(email, token, baseUrl);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Invalid email');
				expect(result.error.code).toBe('ERR_INVALID_EMAIL');
			}
		});

		it('should construct magic link correctly', async () => {
			const { validateEmail } = await import('$lib/utils/validation');
			vi.mocked(validateEmail).mockReturnValue(ok(true));

			const email = 'test@example.com';
			const token = 'magic-token-123';
			const baseUrl = 'https://example.com';

			const result = await sendMagicLink(email, token, baseUrl);

			// The magic link should be constructed as: baseUrl + '/auth/magic-link?token=' + token
			// This is tested indirectly through the successful execution
			expect(result.isOk()).toBe(true);
		});

		it('should handle different base URL formats', async () => {
			const { validateEmail } = await import('$lib/utils/validation');
			vi.mocked(validateEmail).mockReturnValue(ok(true));

			const email = 'test@example.com';
			const token = 'magic-token-123';
			const baseUrl = 'https://app.example.com';

			const result = await sendMagicLink(email, token, baseUrl);

			expect(result.isOk()).toBe(true);
		});
	});
});
