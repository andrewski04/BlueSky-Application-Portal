import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

async function cleanupExpiredRecords() {
	const now = new Date();

	const deletedSessions = await prisma.session.deleteMany({
		where: {
			expiresAt: {
				lt: now
			}
		}
	});

	const deletedTokens = await prisma.magicToken.deleteMany({
		where: {
			expiresAt: {
				lt: now
			}
		}
	});

	console.log(`Cleaned ${deletedSessions.count} expired sessions`);
	console.log(`Cleaned ${deletedTokens.count} expired tokens`);
}

export async function POST({ request }: RequestEvent) {
	const authHeader = request.headers.get('Authorization');
	const expectedApiKey = process.env.CLEANUP_API_KEY;

	if (!expectedApiKey || authHeader !== `Bearer ${expectedApiKey}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		await cleanupExpiredRecords();
		console.log('Database cleanup successful');
		return json({
			success: true
		});
	} catch (error) {
		console.error('Cleanup failed:', error);
		return json(
			{
				success: false,
				error: 'Failed to clean up expired records'
			},
			{ status: 500 }
		);
	}
}
