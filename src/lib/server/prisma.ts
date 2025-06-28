import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
import { ok, err, type Result } from '$lib/utils/error';

const log = new Logger('prisma');

// save Prisma client as global, avoiding multiple instances being started
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Prisma client instance. Wrap Prisma queries in `safePrisma` to enforce safety.
 */
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Wraps Prisma results into a Result object, enforcing type safety.
 * @param promise Prisma query promise
 * @param msg Error message
 * @param code Error code
 * @returns Result object, containing either Error or returned value.
 *
 * @example
 * const result = await prismaResult(prisma.user.findUnique({ where: { id: userId } }));
 * if (result.isErr()) {
 * 	// handle error
 * }
 * return result.unwrap(); // contains the user object
 */
export function prismaResult<T>(promise: Promise<T>): Promise<Result<T>> {
	return promise.then(ok).catch((e) => {
		log.error('Unexpected database error', e);
		return err(e);
	});
}

async function checkDatabaseConnection() {
	try {
		await prisma.$connect();
		log.info('Database connection successful.');
	} catch (error) {
		log.error('Database connection failed.', error);
		process.exit(1);
	}
}

checkDatabaseConnection();

export default prisma;
