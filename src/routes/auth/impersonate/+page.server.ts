import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth/guard';
import { redirect, error } from '@sveltejs/kit';
import { prisma, prismaResult } from '$lib/server/prisma';

export const load = (async ({ locals }) => {
	const { user } = requireAuth(locals);

	if (user.role !== 'ADMIN' && !user.isAdmin) {
		return error(404, 'Not Found');
	}

	// switch impersonater back to admin
	if (user.role === 'USER' && user.isAdmin) {
		const updateResult = await prismaResult(
			prisma.user.update({
				where: { id: user.id },
				data: { role: 'ADMIN' }
			})
		);

		if (updateResult.isErr()) {
			return error(500, 'Failed to update user role.');
		}
	}

	// switch to user role
	if (user.role === 'ADMIN') {
		const updateResult = await prismaResult(
			prisma.user.update({
				where: { id: user.id },
				data: { role: 'USER', isAdmin: true }
			})
		);

		if (updateResult.isErr()) {
			return error(500, 'Failed to update user role.');
		}
	}

	redirect(303, '/');
}) satisfies PageServerLoad;
