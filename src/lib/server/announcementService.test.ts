import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllAnnouncements, createAnnouncement, deleteAnnouncement } from './announcementService';
import { prisma } from './prisma';
import { AppError } from '$lib/utils/error';

// Mock the prisma client
vi.mock('./prisma', () => ({
	prisma: {
		announcement: {
			findMany: vi.fn(),
			create: vi.fn(),
			delete: vi.fn()
		}
	}
}));

// Mock the logger
vi.mock('$lib/utils/logger', () => ({
	Logger: vi.fn().mockImplementation(() => ({
		error: vi.fn()
	}))
}));

describe('AnnouncementService', () => {
	const mockPrisma = vi.mocked(prisma);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getAllAnnouncements', () => {
		it('should retrieve all announcements when amount is -1', async () => {
			const mockAnnouncements = [
				{
					id: '1',
					title: 'Test Announcement 1',
					message: 'Test message 1',
					userId: 'user1',
					createdAt: new Date(),
					user: { id: 'user1', email: 'user1@test.com' }
				},
				{
					id: '2',
					title: 'Test Announcement 2',
					message: 'Test message 2',
					userId: 'user2',
					createdAt: new Date(),
					user: { id: 'user2', email: 'user2@test.com' }
				}
			];

			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.findMany.mockResolvedValue(mockAnnouncements);

			const result = await getAllAnnouncements();

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(mockAnnouncements);
			}
			expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: 'desc' },
				take: undefined,
				include: { user: true }
			});
		});

		it('should retrieve limited announcements when amount is specified', async () => {
			const mockAnnouncements = [
				{
					id: '1',
					title: 'Test Announcement 1',
					message: 'Test message 1',
					userId: 'user1',
					createdAt: new Date(),
					user: { id: 'user1', email: 'user1@test.com' }
				}
			];

			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.findMany.mockResolvedValue(mockAnnouncements);

			const result = await getAllAnnouncements(1);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(mockAnnouncements);
			}
			expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: 'desc' },
				take: 1,
				include: { user: true }
			});
		});

		it('should handle database errors gracefully', async () => {
			const dbError = new Error('Database connection failed');
			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.findMany.mockRejectedValue(dbError);

			const result = await getAllAnnouncements();

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Error getting all announcements');
				expect(result.error.code).toBe('ERR_GET_ALL_ANNOUNCEMENTS');
			}
		});
	});

	describe('createAnnouncement', () => {
		it('should create a new announcement successfully', async () => {
			const mockAnnouncement = {
				id: '1',
				title: 'New Announcement',
				message: 'New message content',
				userId: 'user1',
				createdAt: new Date(),
				user: { id: 'user1', email: 'user1@test.com' }
			};

			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.create.mockResolvedValue(mockAnnouncement);

			const result = await createAnnouncement('New Announcement', 'New message content', 'user1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(mockAnnouncement);
			}
			expect(mockPrisma.announcement.create).toHaveBeenCalledWith({
				data: {
					title: 'New Announcement',
					message: 'New message content',
					userId: 'user1'
				},
				include: { user: true }
			});
		});

		it('should handle database errors during creation', async () => {
			const dbError = new Error('Database connection failed');
			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.create.mockRejectedValue(dbError);

			const result = await createAnnouncement('New Announcement', 'New message content', 'user1');

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Error creating announcement');
				expect(result.error.code).toBe('ERR_CREATE_ANNOUNCEMENT');
			}
		});
	});

	describe('deleteAnnouncement', () => {
		it('should delete an announcement successfully', async () => {
			const mockDeletedAnnouncement = {
				id: '1',
				title: 'Deleted Announcement',
				message: 'Deleted message',
				userId: 'user1',
				createdAt: new Date()
			};

			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.delete.mockResolvedValue(mockDeletedAnnouncement);

			const result = await deleteAnnouncement('1');

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual({ announcementId: '1' });
			}
			expect(mockPrisma.announcement.delete).toHaveBeenCalledWith({
				where: { id: '1' }
			});
		});

		it('should handle database errors during deletion', async () => {
			const dbError = new Error('Database connection failed');
			// @ts-ignore - Mocking Prisma methods
			mockPrisma.announcement.delete.mockRejectedValue(dbError);

			const result = await deleteAnnouncement('1');

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(AppError);
				expect(result.error.message).toBe('Error deleting announcement');
				expect(result.error.code).toBe('ERR_DELETE_ANNOUNCEMENT');
			}
		});
	});
});
