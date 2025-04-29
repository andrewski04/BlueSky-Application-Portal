import { prisma } from '$lib/server/prisma';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { User, Session } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import { err, ok, AppError, type Result } from '$lib/util/error';

// API to manage user session tokens
// Session tokens are stored in cookies to authenticate users,
// not to be confused with magic tokens used for one time login

/**
 * Generates a new 32-byte session token.
 *
 * @returns - The generated session token.
 */
function generateSessionToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

/**
 * Creates a new session for the user, returning the session object and the token.
 *
 * Note that session ID is the hashed token, the returned token
 * should be used to set cookies as this will be forgotten by the server!
 *
 * @param userId - User ID to create session for.
 * @returns - An object containing the session object and the token.
 */
export async function createSession(
	userId: string
): Promise<Result<{ session: Session; token: string }>> {
	const token = generateSessionToken();
	const hashedToken = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		hashedToken,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		createdAt: new Date(Date.now())
	};
	await prisma.session.create({
		data: session
	});
	if (!session) {
		return err(new AppError('Error creating session', 'ERR_CREATE_SESSION'));
	}
	return ok({ session, token });
}

/**
 * Validates a session token, returning the session object and the user object.
 *
 * @param token - The session token to validate.
 * @returns - An object containing the session object and the user object.
 */
export async function validateSessionToken(
	token: string
): Promise<{ session: Session | null; user: User | null }> {
	const hashedToken = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await prisma.session.findUnique({
		where: {
			hashedToken
		},
		include: {
			user: true
		}
	});
	if (result === null) {
		return { session: null, user: null };
	}
	const { user, ...session } = result;
	if (Date.now() >= session.expiresAt.getTime()) {
		await prisma.session.delete({ where: { hashedToken } });
		return { session: null, user: null };
	}

	// if session expires within 12 hours, refresh it to the next 24 hours
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 12) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
		await prisma.session.update({
			where: {
				hashedToken: session.hashedToken
			},
			data: {
				expiresAt: session.expiresAt
			}
		});
	}
	return { session, user };
}

/**
 * Invalidates a session by its token.
 *
 * @param sessionToken - The token of the session to invalidate.
 * @param hashed - True if the token is already hashed, false if raw.
 */
export async function invalidateSession(sessionToken: string, hashed: boolean): Promise<void> {
	if (!hashed) {
		sessionToken = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
	}
	await prisma.session.delete({ where: { hashedToken: sessionToken } });
}

/**
 * Invalidates all sessions for a user.
 *
 * @param userId - The ID of the user to invalidate sessions for.
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
	await prisma.session.deleteMany({ where: { userId } });
}

/**
 * Sets the session token cookie.
 *
 * @param event - The request event partial (containing cookies).
 * @param token - The session token.
 * @param expiresAt - The expiration date of the session.
 */
export function setSessionTokenCookie(
	event: { cookies: RequestEvent['cookies'] },
	token: string,
	expiresAt: Date
): void {
	event.cookies.set('session', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt
	});
}

/**
 * Deletes the session token cookie.
 *
 * @param event - The request event partial (containing cookies).
 */
export function deleteSessionTokenCookie(event: { cookies: RequestEvent['cookies'] }): void {
	event.cookies.delete('session', { path: '/' });
}

/**
 * Gets the token from the session cookie.
 *
 * @param event - The request event partial (containing cookies).
 * @returns - The session token.
 */
export function getSessionTokenCookie(event: {
	cookies: RequestEvent['cookies'];
}): string | undefined {
	return event.cookies.get('session');
}
