import { invalidateMagicToken } from '$lib/server/auth/magicToken';
import { createUserIfNotExists } from '$lib/server/auth/user';
import { createSession } from '$lib/server/auth/session';
import { AppError, err, ok, type Result } from '$lib/util/error';

interface AuthenticateUserOptions {
	email: string;
	hashedMagicToken: string;
	redirectTo: string;
}

interface AuthenticateUserResult {
	success: boolean;
	redirectTo: string;
	token: string;
	expiresAt: Date;
}

/**
 * Handles authentication flow on pages such as `/auth/check-email` and `/auth/magic-link`.
 *
 * - Invalidates the magic token
 * - Creates or finds the user
 * - Creates a session
 * - Handles redirect to user-setup if needed
 * - Returns session token and expiration date
 *
 * @param options - User's email, hashed magic token, and optional redirect URL.
 * @returns Result with error or success, redirect URL, session token and expiration date.
 *
 * @example
 * const result = await authenticateUserWithMagicToken({
 *   email: 'john@doe.com',
 *   hashedMagicToken: 'hashed-token',
 *   redirectTo: '/dashboard'
 * });
 * if (result.isErr()) {
 *   // handle error
 * }
 * const { success, redirectTo, token, expiresAt } = result.unwrap();
 * // Set the session cookie in the endpoint
 * setSessionTokenCookie({ cookies }, token, expiresAt);
 * if (success) {
 *   // redirect to dashboard
 * } else {
 *   // handle failure
 * }
 */
export async function authenticateUserWithMagicToken({
	email,
	hashedMagicToken,
	redirectTo = '/'
}: AuthenticateUserOptions): Promise<Result<AuthenticateUserResult>> {
	try {
		await invalidateMagicToken(hashedMagicToken, true);

		const createUserResult = await createUserIfNotExists(email);
		if (createUserResult.isErr()) {
			return createUserResult.unwrapErr();
		}
		const { user } = createUserResult.unwrap();

		const sessionResult = await createSession(user.id);
		if (sessionResult.isErr()) {
			return sessionResult.unwrapErr();
		}
		const { session, token } = sessionResult.unwrap();

		if (!user.firstName || !user.lastName) {
			redirectTo = '/user/account-setup?redirect=' + encodeURIComponent(redirectTo);
		}

		return ok({
			success: true,
			redirectTo,
			token,
			expiresAt: session.expiresAt
		});
	} catch (error) {
		return err(
			new AppError(
				error instanceof Error ? error.message : 'Unknown authentication error',
				'ERR_AUTH_UNKNOWN'
			)
		);
	}
}
