import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { S3Service } from '$lib/server/storage/s3Service';
import { prisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/auth/guard';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Ensure user is authenticated
	const { user } = requireAuth(locals);

	const { fileId } = params;

	if (!fileId) {
		throw error(400, 'File ID is required');
	}

	try {
		// Verify user has access to this file
		let fileUpload = await prisma.fileUpload.findFirst({
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
			fileUpload = await prisma.fileUpload.findUnique({
				where: { id: fileId }
			});

			if (!fileUpload) {
				throw error(404, 'File not found');
			}
		}

		const s3Service = new S3Service();
		console.log('Downloading file:', {
			fileId,
			filename: fileUpload.filename,
			storagePath: fileUpload.storagePath
		});

		// Get the file stream from S3/MinIO
		const fileStream = await s3Service.getFileStream(fileId, fileUpload.filename);

		if (!fileStream) {
			throw error(404, 'File not found in storage');
		}

		// Convert the readable stream to a buffer
		const chunks = [];
		for await (const chunk of fileStream as any) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);

		return new Response(buffer, {
			headers: {
				'Content-Type': fileUpload.mimeType,
				'Content-Disposition': `attachment; filename="${fileUpload.filename}"`,
				'Content-Length': buffer.length.toString()
			}
		});
	} catch (err) {
		console.error('Download error:', err);
		if (err instanceof Response) {
			throw err;
		}
		throw error(500, 'Failed to generate download URL');
	}
};
