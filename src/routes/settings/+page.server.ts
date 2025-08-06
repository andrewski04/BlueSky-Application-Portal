import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth/guard';
import type { Actions } from '@sveltejs/kit';
import { prismaResult, prisma } from '$lib/server/prisma';

export const load: PageServerLoad = (async ({ locals }) => {
	const { user } = requireAuth(locals);
	const role = user.role;

	return {
		user,
		role
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	saveAccountInfo: async ({ request, locals }) => {
		const { user } = requireAuth(locals);

		const formData = await request.formData();
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const etsuApplicationComplete = formData.get('etsuApplicationComplete') === 'on';
		const etsuEmail = formData.get('etsuEmail') as string;
		const etsuENumber = formData.get('etsuENumber') as string;
		const phoneNumber = formData.get('phoneNumber') as string;

		// const email = formData.get('email') as string;  // email updating not implemented

		if (!firstName.trim() || !lastName.trim()) {
			return { success: false, error: 'First and last name are required.' };
		}

		if (phoneNumber && phoneNumber.trim()) {
			// Accept E.164 format (+1234567890)
			const phoneRegex = /^(\+1[0-9]{10}|\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}|\+[0-9]{1,3}[0-9]{6,14})$/;
			if (!phoneRegex.test(phoneNumber.trim())) {
				return {
					success: false,
					error: 'Please enter a valid phone number'
				};
			}
		}

		const updateResult = await prismaResult(
			prisma.user.update({
				where: { id: user.id },
				data: {
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					etsuApplicationComplete,
					etsuEmail: etsuEmail?.trim() || null,
					etsuENumber: etsuENumber?.trim() || null,
					phoneNumber: phoneNumber?.trim() || null
				}
			})
		);

		if (updateResult.isErr()) {
			return { success: false, error: 'Failed to update user settings.' };
		}

		return {
			success: true,
			message: 'User settings updated successfully.',
			data: { user: updateResult.value }
		};
	}
};
