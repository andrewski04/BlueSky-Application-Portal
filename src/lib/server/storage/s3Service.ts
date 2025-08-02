import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error } from '@sveltejs/kit';

export class S3Service {
	private client: S3Client;
	private bucket: string;

	constructor() {
		this.client = new S3Client({
			endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
			region: 'us-east-1',
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
				secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
			},
			forcePathStyle: true
		});
		this.bucket = process.env.S3_BUCKET || 'applications';
	}

	/**
	 * Upload a file to S3/MinIO
	 */
	async uploadFile(
		fileId: string,
		file: Buffer,
		mimeType: string,
		originalFilename: string
	): Promise<string> {
		try {
			const key = `uploads/${fileId}/${originalFilename}`;
			await this.client.send(
				new PutObjectCommand({
					Bucket: this.bucket,
					Key: key,
					Body: file,
					ContentType: mimeType,
					Metadata: {
						originalFilename,
						uploadedAt: new Date().toISOString()
					}
				})
			);
			return key;
		} catch (err) {
			console.error('Error uploading file to S3:', err);
			throw error(500, 'Failed to upload file');
		}
	}

	/**
	 * Get a presigned download URL for a file
	 */
	async getDownloadUrl(fileId: string, filename: string): Promise<string> {
		try {
			const key = `uploads/${fileId}/${filename}`;
			const command = new GetObjectCommand({
				Bucket: this.bucket,
				Key: key
			});
			return await getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 hour
		} catch (err) {
			console.error('Error generating download URL:', err);
			throw error(500, 'Failed to generate download URL');
		}
	}

	/**
	 * Delete a file from S3/MinIO
	 */
	async deleteFile(fileId: string, filename: string): Promise<void> {
		try {
			const key = `uploads/${fileId}/${filename}`;
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
		} catch (err) {
			console.error('Error deleting file from S3:', err);
			throw error(500, 'Failed to delete file');
		}
	}

	/**
	 * Check if a file exists
	 */
	async fileExists(fileId: string, filename: string): Promise<boolean> {
		try {
			const key = `uploads/${fileId}/${filename}`;
			await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Get file metadata
	 */
	async getFileMetadata(fileId: string, filename: string) {
		try {
			const key = `uploads/${fileId}/${filename}`;
			const response = await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
			return {
				size: response.ContentLength,
				mimeType: response.ContentType,
				lastModified: response.LastModified,
				metadata: response.Metadata
			};
		} catch (err) {
			console.error('Error getting file metadata:', err);
			throw error(404, 'File not found');
		}
	}

	/**
	 * Get file as a readable stream
	 */
	async getFileStream(fileId: string, filename: string) {
		try {
			const key = `uploads/${fileId}/${filename}`;
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
			return response.Body;
		} catch (err) {
			console.error('Error getting file stream:', err);
			throw error(404, 'File not found');
		}
	}
}
