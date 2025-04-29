import { prisma } from '$lib/server/prisma';
import type { User } from '@prisma/client';
import { validateEmail } from '$lib/util/validation';
import { err, ok, AppError, type Result } from '$lib/util/error';

/**
 * Finds a user by their email address.
 *
 * @param email - The email address to search for.
 * @returns The user or null if not found.
 */
export async function findUserByEmail(email: string) {
	return await prisma.user.findUnique({
		where: { email }
	});
}

/**
 * Creates a user if they don't already exist.
 *
 * @param email - The email address of the user.
 * @returns The existing or newly created user.
 */
export async function createUserIfNotExists(email: string): Promise<Result<{ user: User }>> {
	if (!email || !validateEmail(email).isOk()) {
		return err(new AppError('Invalid email', 'ERR_INVALID_EMAIL'));
	}

	let user = await findUserByEmail(email);

	try {
		if (!user) {
			user = await prisma.user.create({
				data: { email }
			});
		}
	} catch {
		return err(new AppError('Error finding or creating user', 'ERR_FIND_CREATE_USER'));
	}

	return ok({ user });
}
