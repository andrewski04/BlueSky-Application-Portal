import { requireRole } from '$lib/server/auth/guard';
import type { PageServerLoad } from './$types';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';

const log = new Logger('admin.users.page.server');

export const load = (async ({ locals }) => {
	const { user } = requireRole(locals, 'ADMIN');

	const usersResult = await prismaResult(
		prisma.user.findMany({
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				isSetup: true,
				createdAt: true,
				_count: {
					select: {
						sessions: true,
						ApplicationResponse: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	);

	if (usersResult.isErr()) {
		log.error('Error getting users', usersResult.error);
		return { user, users: [], error: 'Unable to fetch users' };
	}

	return {
		user,
		users: usersResult.value
	};
}) satisfies PageServerLoad;
