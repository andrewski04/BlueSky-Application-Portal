import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { S3Service } from '$lib/server/storage/s3Service';
import { prisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/auth/guard';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Ensure user is authenticated
	const { user } = requireAuth(locals);

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const questionId = formData.get('questionId') as string;

		if (!file) {
			throw error(400, 'No file provided');
		}

		if (!questionId) {
			throw error(400, 'Question ID is required');
		}

		// Validate file size (default 10MB limit)
		const maxFileSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxFileSize) {
			throw error(400, `File size exceeds maximum limit of ${maxFileSize / (1024 * 1024)}MB`);
		}

		// Validate file type if specified
		const question = await prisma.questionVersion.findUnique({
			where: { id: questionId }
		});

		if (question?.acceptedTypes) {
			const acceptedTypes = question.acceptedTypes.split(',').map((t) => t.trim());
			const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

			// Check if file extension is in accepted types
			const extensionMatch = acceptedTypes.some(
				(type) =>
					type.toLowerCase() === fileExtension ||
					type.toLowerCase() === fileExtension.replace('.', '')
			);

			// Check if MIME type matches (for cases where MIME types are specified)
			const mimeMatch = acceptedTypes.some(
				(type) =>
					file.type === type || (type.includes('*') && file.type.startsWith(type.replace('*', '')))
			);

			if (!extensionMatch && !mimeMatch) {
				throw error(
					400,
					`File type ${file.type} (${fileExtension}) is not accepted. Accepted types: ${question.acceptedTypes}`
				);
			}
		}

		// Validate file size against question limit
		if (question?.maxFileSizeBytes && file.size > question.maxFileSizeBytes) {
			throw error(400, `File size exceeds question limit of ${question.maxFileSizeBytes} bytes`);
		}

		const fileId = crypto.randomUUID();
		const buffer = Buffer.from(await file.arrayBuffer());

		const s3Service = new S3Service();
		const storagePath = await s3Service.uploadFile(fileId, buffer, file.type, file.name);

		// Create file upload record in database
		const fileUpload = await prisma.fileUpload.create({
			data: {
				id: fileId,
				filename: file.name,
				mimeType: file.type,
				sizeBytes: file.size,
				storagePath
			}
		});

		return json({
			success: true,
			fileUpload: {
				id: fileUpload.id,
				filename: fileUpload.filename,
				mimeType: fileUpload.mimeType,
				sizeBytes: fileUpload.sizeBytes
			}
		});
	} catch (err) {
		console.error('Upload error:', err);
		if (err instanceof Response) {
			throw err;
		}
		throw error(500, 'Failed to upload file');
	}
};
