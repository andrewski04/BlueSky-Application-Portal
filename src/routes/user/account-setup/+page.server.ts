import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateSessionToken, getSessionTokenCookie } from '$lib/server/auth/session';
import prisma from '$lib/server/prisma';
import { AppError, err, ok, type Result } from '$lib/util/error';
import { requireAuth } from '$lib/server/auth/guard';

export const load: PageServerLoad = async (event) => {
	const { user } = requireAuth(event);

	// this should implement User field `account-setup` or something
	if (user.firstName && user.lastName) {
		throw redirect(303, '/');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			firstName: user.firstName || '',
			lastName: user.lastName || ''
		}
	};
};

// this should be abstracted into lib/server/auth/user or another user service at some point
async function updateUserProfile(
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
				lastName: lastName.trim()
			}
		});

		return ok(true);
	} catch {
		return err(new AppError('Failed to update profile', 'ERR_UPDATE_PROFILE'));
	}
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const userId = formData.get('userId') as string;

		const sessionToken = getSessionTokenCookie({ cookies });
		if (!sessionToken) {
			return { success: false, error: 'Authentication required' };
		}

		const { user } = await validateSessionToken(sessionToken);
		if (!user || user.id !== userId) {
			return { success: false, error: 'Invalid session' };
		}

		const result = await updateUserProfile(userId, firstName, lastName);

		if (result.isErr()) {
			return {
				success: false,
				error: result.error.message,
				firstName,
				lastName
			};
		}

		throw redirect(303, '/');
	}
};
