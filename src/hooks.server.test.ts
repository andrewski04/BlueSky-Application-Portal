import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from './hooks.server';
import * as session from '$lib/server/auth/session';

// Mock the session module
vi.mock('$lib/server/auth/session', () => ({
	validateSessionToken: vi.fn(),
	setSessionTokenCookie: vi.fn(),
	deleteSessionTokenCookie: vi.fn(),
	getSessionTokenCookie: vi.fn()
}));

describe('hooks.server', () => {
	const mockEvent = {
		locals: {},
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn()
		}
	};

	const mockResolve = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockEvent.locals = {};
		mockResolve.mockReturnValue('resolved');
	});

	describe('handle function', () => {
		it('should handle request without token', async () => {
			vi.mocked(session.getSessionTokenCookie).mockReturnValue(null);

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockEvent.locals.user).toBeNull();
			expect(mockEvent.locals.session).toBeNull();
			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
			expect(result).toBe('resolved');
		});

		it('should handle valid session token', async () => {
			const mockToken = 'valid-token';
			const mockSession = { expiresAt: new Date() };
			const mockUser = { id: 'user-1', email: 'test@example.com' };

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockResolvedValue({
				session: mockSession,
				user: mockUser
			});

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockEvent.locals.user).toEqual(mockUser);
			expect(mockEvent.locals.session).toEqual(mockSession);
			expect(session.setSessionTokenCookie).toHaveBeenCalledWith(
				mockEvent,
				mockToken,
				mockSession.expiresAt
			);
			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
			expect(result).toBe('resolved');
		});

		it('should handle invalid session token', async () => {
			const mockToken = 'invalid-token';

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockResolvedValue({
				session: null,
				user: null
			});

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockEvent.locals.user).toBeNull();
			expect(mockEvent.locals.session).toBeNull();
			expect(session.deleteSessionTokenCookie).toHaveBeenCalledWith(mockEvent);
			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
			expect(result).toBe('resolved');
		});

		it('should handle session validation error', async () => {
			const mockToken = 'error-token';

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockRejectedValue(
				new Error('Database connection failed')
			);

			// The actual code doesn't handle errors, so this should throw
			await expect(handle({ event: mockEvent, resolve: mockResolve })).rejects.toThrow(
				'Database connection failed'
			);
		});

		it('should handle empty string token', async () => {
			const mockToken = '';

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			// Empty string is falsy, so it should go to the "no token" branch
			expect(mockEvent.locals.user).toBeNull();
			expect(mockEvent.locals.session).toBeNull();
			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
			expect(result).toBe('resolved');
		});

		it('should handle whitespace-only token', async () => {
			const mockToken = '   ';

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockResolvedValue({
				session: null,
				user: null
			});

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			// Whitespace-only string is truthy, so it should go to validation
			expect(mockEvent.locals.user).toBeNull();
			expect(mockEvent.locals.session).toBeNull();
			expect(session.deleteSessionTokenCookie).toHaveBeenCalledWith(mockEvent);
			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
			expect(result).toBe('resolved');
		});

		it('should preserve existing locals when setting session', async () => {
			const mockToken = 'valid-token';
			const mockSession = { expiresAt: new Date() };
			const mockUser = { id: 'user-1' };

			// Set some existing locals
			mockEvent.locals = {
				existing: 'value',
				another: 'property'
			};

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockResolvedValue({
				session: mockSession,
				user: mockUser
			});

			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockEvent.locals.user).toEqual(mockUser);
			expect(mockEvent.locals.session).toEqual(mockSession);
			expect(mockEvent.locals.existing).toBe('value');
			expect(mockEvent.locals.another).toBe('property');
		});

		it('should handle session with null user', async () => {
			const mockToken = 'valid-token';
			const mockSession = { expiresAt: new Date() };

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockResolvedValue({
				session: mockSession,
				user: null
			});

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockEvent.locals.user).toBeNull();
			expect(mockEvent.locals.session).toEqual(mockSession);
			expect(session.setSessionTokenCookie).toHaveBeenCalledWith(
				mockEvent,
				mockToken,
				mockSession.expiresAt
			);
			expect(result).toBe('resolved');
		});

		it('should handle session with null session but valid user', async () => {
			const mockToken = 'valid-token';
			const mockUser = { id: 'user-1' };

			vi.mocked(session.getSessionTokenCookie).mockReturnValue(mockToken);
			vi.mocked(session.validateSessionToken).mockResolvedValue({
				session: null,
				user: mockUser
			});

			const result = await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockEvent.locals.user).toBeNull();
			expect(mockEvent.locals.session).toBeNull();
			expect(session.deleteSessionTokenCookie).toHaveBeenCalledWith(mockEvent);
			expect(result).toBe('resolved');
		});
	});
});
