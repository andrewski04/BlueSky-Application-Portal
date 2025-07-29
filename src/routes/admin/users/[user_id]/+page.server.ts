import { requireRole } from '$lib/server/auth/guard';
import type { PageServerLoad } from './$types';
import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';
import { error } from '@sveltejs/kit';

const log = new Logger('admin.user.detail.page.server');

export const load = (async ({ locals, params }) => {
	const { user: currentUser } = requireRole(locals, 'ADMIN');
	const { user_id } = params;

	if (!user_id) {
		throw error(400, 'User ID is required');
	}

	// Fetch user details with related data
	const userResult = await prismaResult(
		prisma.user.findUnique({
			where: { id: user_id },
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
			}
		})
	);

	if (userResult.isErr()) {
		log.error('Error fetching user', userResult.error);
		throw error(500, 'Unable to fetch user details');
	}

	const user = userResult.value;
	if (!user) {
		throw error(404, 'User not found');
	}

	// Fetch user's form responses
	const responsesResult = await prismaResult(
		prisma.applicationResponse.findMany({
			where: { userId: user_id },
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				form: {
					select: {
						id: true,
						name: true,
						description: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	);

	if (responsesResult.isErr()) {
		log.error('Error fetching user responses', responsesResult.error);
		throw error(500, 'Unable to fetch user responses');
	}

	return {
		currentUser,
		user,
		responses: responsesResult.value
	};
}) satisfies PageServerLoad;
