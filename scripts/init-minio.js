#!/usr/bin/env node

import { S3Client, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

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

async function initMinio() {
	try {
		console.log('Initializing MinIO...');

		// Create bucket if it doesn't exist
		try {
			await s3Client.send(
				new CreateBucketCommand({
					Bucket: bucketName
				})
			);
			console.log(`Created bucket: ${bucketName}`);
		} catch (error) {
			if (error.name === 'BucketAlreadyExists') {
				console.log(`Bucket already exists: ${bucketName}`);
			} else {
				throw error;
			}
		}

		// Set bucket policy for better security (optional)
		const bucketPolicy = {
			Version: '2012-10-17',
			Statement: [
				{
					Sid: 'DenyUnencryptedObjectUploads',
					Effect: 'Deny',
					Principal: '*',
					Action: 's3:PutObject',
					Resource: `arn:aws:s3:::${bucketName}/*`,
					Condition: {
						StringNotEquals: {
							's3:x-amz-server-side-encryption': 'AES256'
						}
					}
				}
			]
		};

		try {
			await s3Client.send(
				new PutBucketPolicyCommand({
					Bucket: bucketName,
					Policy: JSON.stringify(bucketPolicy)
				})
			);
			console.log('✅ Set bucket policy');
		} catch (error) {
			console.log('⚠️  Could not set bucket policy (this is optional):', error.message);
		}

		console.log('MinIO initialization complete!');
		console.log(`Bucket: ${bucketName}`);
		console.log(`MinIO Console: http://localhost:9001`);
		console.log(`Login: minioadmin / minioadmin`);
	} catch (error) {
		console.error('Failed to initialize MinIO:', error);
		process.exit(1);
	}
}

initMinio();
