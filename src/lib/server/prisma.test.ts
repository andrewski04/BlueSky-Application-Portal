import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prismaResult } from './prisma';
import { ok, err } from '$lib/utils/error';

// Mock the logger
vi.mock('$lib/utils/logger', () => ({
	Logger: vi.fn().mockImplementation(() => ({
		error: vi.fn(),
		info: vi.fn()
	}))
}));

// Mock PrismaClient
vi.mock('@prisma/client', () => ({
	PrismaClient: vi.fn().mockImplementation(() => ({
		$connect: vi.fn(),
		$disconnect: vi.fn()
	}))
}));

describe('Prisma', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('prismaResult', () => {
		it('should wrap successful promise result in ok', async () => {
			const mockData = { id: '1', name: 'Test' };
			const mockPromise = Promise.resolve(mockData);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(mockData);
			}
		});

		it('should wrap rejected promise result in err', async () => {
			const mockError = new Error('Database error');
			const mockPromise = Promise.reject(mockError);

			const result = await prismaResult(mockPromise);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBe(mockError);
			}
		});

		it('should handle async operations correctly', async () => {
			const mockData = { id: '2', name: 'Async Test' };
			const mockPromise = new Promise((resolve) => {
				setTimeout(() => resolve(mockData), 10);
			});

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(mockData);
			}
		});

		it('should handle complex data structures', async () => {
			const mockComplexData = {
				id: '3',
				user: {
					id: 'user1',
					email: 'test@example.com',
					profile: {
						firstName: 'John',
						lastName: 'Doe'
					}
				},
				metadata: {
					createdAt: new Date(),
					tags: ['tag1', 'tag2']
				}
			};

			const mockPromise = Promise.resolve(mockComplexData);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(mockComplexData);
			}
		});

		it('should handle null values', async () => {
			const mockPromise = Promise.resolve(null);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBeNull();
			}
		});

		it('should handle undefined values', async () => {
			const mockPromise = Promise.resolve(undefined);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBeUndefined();
			}
		});

		it('should handle empty arrays', async () => {
			const mockPromise = Promise.resolve([]);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual([]);
			}
		});

		it('should handle empty objects', async () => {
			const mockPromise = Promise.resolve({});

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual({});
			}
		});

		it('should handle different error types', async () => {
			const errorTypes = [
				new Error('Standard error'),
				new TypeError('Type error'),
				new RangeError('Range error'),
				new SyntaxError('Syntax error'),
				'String error',
				500,
				null,
				undefined
			];

			for (const error of errorTypes) {
				const mockPromise = Promise.reject(error);

				const result = await prismaResult(mockPromise);

				expect(result.isErr()).toBe(true);
				if (result.isErr()) {
					expect(result.error).toBe(error);
				}
			}
		});

		it('should handle promises that resolve to false', async () => {
			const mockPromise = Promise.resolve(false);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe(false);
			}
		});

		it('should handle promises that resolve to zero', async () => {
			const mockPromise = Promise.resolve(0);

			const result = await prismaResult(mockPromise);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe(0);
			}
		});
	});
});
