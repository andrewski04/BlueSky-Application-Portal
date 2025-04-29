import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/auth/guard';

export const load: PageServerLoad = async (event) => {
	const { user } = requireAuth(event);

	try {
		const users = await prisma.user.findMany();
		return {
			currentUser: user,
			users
		};
	} catch {
		return {
			currentUser: user,
			users: [],
			error: 'Error fetching users'
		};
	}
};
