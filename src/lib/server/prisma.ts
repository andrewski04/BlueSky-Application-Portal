import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';

// save Prisma client as global, avoiding multiple instances being started

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function checkDatabaseConnection() {
	const log = new Logger('prisma');
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
