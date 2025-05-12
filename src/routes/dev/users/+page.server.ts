import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { UserRole } from '@prisma/client';
import { fail } from '@sveltejs/kit';
//import { requireAuth } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';

const log = new Logger('dev/users page');

export const load: PageServerLoad = async () => {
	//const { user } = requireAuth(event);

	try {
		const users = await prisma.user.findMany({
			orderBy: {
				email: 'desc'
			}
		});
		return {
			//currentUser: user,
			users
		};
	} catch {
		return {
			//currentUser: user,
			users: [],
			error: 'Error fetching users'
		};
	}
};

export const actions: Actions = {
	updateRole: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const newRole = formData.get('newRole')?.toString() as UserRole;

		if (!userId || !newRole || !(newRole === UserRole.ADMIN || newRole === UserRole.USER)) {
			return fail(400, { error: 'Invalid user ID or role' });
		}

		try {
			await prisma.user.update({
				where: { id: userId },
				data: { role: newRole }
			});

			return { success: true };
		} catch (error) {
			log.error('Error updating user role', error);
			return fail(500, { error: 'Failed to update user role' });
		}
	}
};
