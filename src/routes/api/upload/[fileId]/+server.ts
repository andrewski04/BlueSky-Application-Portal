import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { S3Service } from '$lib/server/storage/s3Service';
import { prisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/auth/guard';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Ensure user is authenticated
	const { user } = requireAuth(locals);

	const { fileId } = params;

	if (!fileId) {
		throw error(400, 'File ID is required');
	}

	try {
		// Verify user has access to this file
		const fileUpload = await prisma.fileUpload.findFirst({
			where: {
				id: fileId,
				answers: {
					some: {
						application: {
							userId: user.id
						}
					}
				}
			}
		});

		if (!fileUpload) {
			// Also check if user is admin
			if (user.role !== 'ADMIN') {
				throw error(404, 'File not found');
			}

			// For admins, check if file exists
			const adminFileUpload = await prisma.fileUpload.findUnique({
				where: { id: fileId }
			});

			if (!adminFileUpload) {
				throw error(404, 'File not found');
			}
		}

		// Delete from S3/MinIO
		const s3Service = new S3Service();
		await s3Service.deleteFile(fileId, fileUpload?.filename || '');

		// Delete from database
		await prisma.fileUpload.delete({
			where: { id: fileId }
		});

		return json({ success: true });
	} catch (err) {
		console.error('Delete error:', err);
		if (err instanceof Response) {
			throw err;
		}
		throw error(500, 'Failed to delete file');
	}
};
