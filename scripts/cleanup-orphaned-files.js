#!/usr/bin/env node

import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const s3Client = new S3Client({
	endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
	region: 'us-east-1',
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
		secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
	},
	forcePathStyle: true
});

const bucketName = process.env.S3_BUCKET || 'applications';

async function cleanupOrphanedFiles() {
	try {
		console.log('Starting orphaned file cleanup...');

		// Get all file IDs from the database
		const dbFiles = await prisma.fileUpload.findMany({
			select: { id: true }
		});
		const dbFileIds = new Set(dbFiles.map((f) => f.id));

		console.log(`Found ${dbFileIds.size} files in database`);

		// List all objects in S3
		const s3Objects = [];
		let continuationToken = undefined;

		do {
			const response = await s3Client.send(
				new ListObjectsV2Command({
					Bucket: bucketName,
					ContinuationToken: continuationToken
				})
			);

			if (response.Contents) {
				s3Objects.push(...response.Contents);
			}

			continuationToken = response.NextContinuationToken;
		} while (continuationToken);

		console.log(`Found ${s3Objects.length} objects in S3`);

		// Find orphaned files (in S3 but not in database)
		const orphanedFiles = s3Objects.filter((obj) => {
			if (!obj.Key) return false;
			// Extract file ID from key (uploads/{fileId}/{filename})
			const parts = obj.Key.split('/');
			if (parts.length < 3 || parts[0] !== 'uploads') return false;
			const fileId = parts[1];
			return !dbFileIds.has(fileId);
		});

		console.log(`Found ${orphanedFiles.length} orphaned files`);

		if (orphanedFiles.length === 0) {
			console.log('No orphaned files to clean up');
			return;
		}

		// Delete orphaned files
		let deletedCount = 0;
		for (const file of orphanedFiles) {
			try {
				await s3Client.send(
					new DeleteObjectCommand({
						Bucket: bucketName,
						Key: file.Key
					})
				);
				deletedCount++;
				console.log(`Deleted: ${file.Key}`);
			} catch (error) {
				console.error(`Failed to delete ${file.Key}:`, error.message);
			}
		}

		console.log(`Cleanup complete! Deleted ${deletedCount} orphaned files`);
	} catch (error) {
		console.error('Cleanup failed:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

cleanupOrphanedFiles();
