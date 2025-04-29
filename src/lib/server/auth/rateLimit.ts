import { prisma } from '$lib/server/prisma';
import type { AuthAttemptType } from '@prisma/client';

/**
 * Record an authentication attempt (login request or OTP verification).
 */
export async function recordAuthAttempt(params: {
	email?: string;
	ipAddress: string;
	userAgent?: string;
	type: AuthAttemptType;
	success: boolean;
}): Promise<void> {
	await prisma.authAttempt.create({
		data: {
			email: params.email,
			ipAddress: params.ipAddress,
			userAgent: params.userAgent,
			type: params.type,
			success: params.success
		}
	});
}

/**
 * Clear recent authentication attempts for a user/IP/userAgent and type.
 */
export async function clearAuthAttempts(params: {
	email?: string;
	ipAddress?: string;
	userAgent?: string;
	type: AuthAttemptType;
	windowMs: number;
}): Promise<void> {
	const since = new Date(Date.now() - params.windowMs);

	await prisma.authAttempt.deleteMany({
		where: {
			type: params.type,
			createdAt: { gte: since },
			...(params.email ? { email: params.email } : {}),
			...(params.ipAddress ? { ipAddress: params.ipAddress } : {}),
			...(params.userAgent ? { userAgent: params.userAgent } : {})
		}
	});
}

/**
 * Count recent authentication attempts within a time window.
 * You can filter by email, IP, userAgent, or any combination.
 */
export async function countRecentAttempts(params: {
	email?: string;
	ipAddress?: string;
	userAgent?: string;
	type: AuthAttemptType;
	windowMs: number;
}): Promise<number> {
	const since = new Date(Date.now() - params.windowMs);

	return prisma.authAttempt.count({
		where: {
			type: params.type,
			createdAt: { gte: since },
			...(params.email ? { email: params.email } : {}),
			...(params.ipAddress ? { ipAddress: params.ipAddress } : {}),
			...(params.userAgent ? { userAgent: params.userAgent } : {})
		}
	});
}
