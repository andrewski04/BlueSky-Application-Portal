import { prisma } from '$lib/server/prisma';
import type { User } from '@prisma/client';
import { validateEmail } from '$lib/utils/validation';
import { err, ok, AppError, type Result } from '$lib/utils/error';

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

// this could be further abstracted to a generic user update function
export async function userSetupByUserId(
	userId: string,
	firstName: string,
	lastName: string
): Promise<Result<boolean>> {
	if (!firstName || firstName.trim() === '') {
		return err(new AppError('First name is required', 'ERR_FIRST_NAME_REQUIRED'));
	}

	if (!lastName || lastName.trim() === '') {
		return err(new AppError('Last name is required', 'ERR_LAST_NAME_REQUIRED'));
	}

	try {
		await prisma.user.update({
			where: { id: userId },
			data: {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				isSetup: true
			}
		});

		return ok(true);
	} catch {
		return err(new AppError('Failed to update profile', 'ERR_UPDATE_PROFILE'));
	}
}
