import { PrismaClient } from '@prisma/client';

// save Prisma client as global, avoiding multiple instances being started

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function checkDatabaseConnection() {
	try {
		await prisma.$connect();
		console.log('Database connection successful.');
	} catch (error) {
		console.error('Database connection failed.');
		console.error(error);
		process.exit(1);
	}
}

checkDatabaseConnection();

export default prisma;
