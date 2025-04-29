import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireRole } from './guard';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User, Session } from '@prisma/client';

// Mock redirect function
vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		redirect: vi.fn().mockImplementation((status, location) => {
			throw { status, location };
		})
	};
});

describe('Auth Guards', () => {
	let mockEvent: RequestEvent;
	const mockUser: User = {
		id: 'user123',
		email: 'test@example.com',
		role: 'user',
		firstName: 'John',
		lastName: 'Doe',
		createdAt: new Date()
	};

	const mockSession: Session = {
		hashedToken: 'hashed_token',
		userId: 'user123',
		expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
		createdAt: new Date()
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Create a mock RequestEvent with locals
		mockEvent = {
			locals: {
				user: null,
				session: null
			}
		} as unknown as RequestEvent;
	});

	describe('requireAuth', () => {
		it('should return user and session when authenticated', () => {
			// Set up authenticated user
			mockEvent.locals.user = mockUser;
			mockEvent.locals.session = mockSession;

			const result = requireAuth(mockEvent);

			expect(result.user).toBe(mockUser);
			expect(result.session).toBe(mockSession);
			expect(redirect).not.toHaveBeenCalled();
		});

		it('should redirect when user is not authenticated', () => {
			// User is not set in locals
			mockEvent.locals.user = null;
			mockEvent.locals.session = null;

			expect(() => requireAuth(mockEvent)).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
		});

		it('should redirect to custom URL when specified', () => {
			// User is not set in locals
			mockEvent.locals.user = null;
			mockEvent.locals.session = null;

			expect(() => requireAuth(mockEvent, '/custom/login')).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/custom/login');
		});

		it('should redirect when session is missing', () => {
			// User is set but session is not
			mockEvent.locals.user = mockUser;
			mockEvent.locals.session = null;

			expect(() => requireAuth(mockEvent)).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
		});
	});

	describe('requireRole', () => {
		it('should return user and session when authenticated with correct role', () => {
			// Set up authenticated user with 'admin' role
			const adminUser = { ...mockUser, role: 'admin' };
			mockEvent.locals.user = adminUser;
			mockEvent.locals.session = mockSession;

			const result = requireRole(mockEvent, 'admin');

			expect(result.user).toBe(adminUser);
			expect(result.session).toBe(mockSession);
			expect(redirect).not.toHaveBeenCalled();
		});

		it('should redirect when user does not have required role', () => {
			// Set up authenticated user with 'user' role
			mockEvent.locals.user = mockUser; // role is 'user'
			mockEvent.locals.session = mockSession;

			expect(() => requireRole(mockEvent, 'admin')).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
		});

		it('should redirect to custom URL when specified and role is incorrect', () => {
			// Set up authenticated user with 'user' role
			mockEvent.locals.user = mockUser; // role is 'user'
			mockEvent.locals.session = mockSession;

			expect(() => requireRole(mockEvent, 'admin', '/unauthorized')).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/unauthorized');
		});

		it('should redirect when user role is undefined', () => {
			// Set up authenticated user with undefined role
			const userWithoutRole = { ...mockUser, role: undefined };
			mockEvent.locals.user = userWithoutRole;
			mockEvent.locals.session = mockSession;

			expect(() => requireRole(mockEvent, 'admin')).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
		});

		it('should redirect when user is not authenticated', () => {
			// User is not set in locals
			mockEvent.locals.user = null;
			mockEvent.locals.session = null;

			expect(() => requireRole(mockEvent, 'admin')).toThrow();
			expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
		});
	});
});
