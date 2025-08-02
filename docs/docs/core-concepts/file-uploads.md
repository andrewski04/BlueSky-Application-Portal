# File Uploads

The BlueSky Application Portal supports file uploads through an S3-compatible storage backend using MinIO.

## Architecture

File uploads are handled through a proxy architecture where:

1. **Frontend**: Users select files through the `FileUploadQuestion` component
2. **Backend**: Files are uploaded to MinIO (S3-compatible) via API endpoints
3. **Database**: File metadata is stored in the `FileUpload` table
4. **Access Control**: Users can only access files they've uploaded or files from their applications

## Components

### FileUploadQuestion Component

Located at `src/lib/components/application/FileUploadQuestion.svelte`, this component provides:

- File selection with drag-and-drop support
- Real-time validation (file type, size)
- Upload progress indicators
- File preview and management
- Download links for existing files

### S3Service

Located at `src/lib/server/storage/s3Service.ts`, this service handles:

- File uploads to MinIO
- Presigned URL generation for downloads
- File deletion
- File metadata retrieval

## API Endpoints

### Upload File

```
POST /api/upload
Content-Type: multipart/form-data

Parameters:
- file: The file to upload
- questionId: ID of the question this file belongs to
```

### Download File

```
GET /api/download/[fileId]
```

Redirects to a presigned URL for direct download.

### Delete File

```
DELETE /api/upload/[fileId]
```

### Get File Info

```
GET /api/upload/[fileId]/info
```

Returns file metadata (filename, size, type, etc.).

## Database Schema

```sql
model FileUpload {
  id          String   @id @default(cuid())
  filename    String
  mimeType    String
  sizeBytes   Int
  storagePath String
  uploadedAt  DateTime @default(now())

  answers Answer[]
}
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=applications
```

### MinIO Setup

MinIO is automatically configured in `docker-compose.yml`:

```yaml
minio:
  image: minio/minio:latest
  container_name: minio
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  ports:
    - '9000:9000' # API
    - '9001:9001' # Web UI
  volumes:
    - minio_data:/data
```

## Security Features

### Access Control

- Users can only access files from their own applications
- Admins can access all files
- File downloads use presigned URLs with 1-hour expiration

### Validation

- File type validation based on question configuration
- File size limits (configurable per question)
- Maximum file size of 10MB by default

### Storage Security

- Files are stored with unique IDs to prevent enumeration
- Original filenames are preserved in metadata
- Automatic cleanup of orphaned files

## Usage

### Creating a File Upload Question

When creating a form question, set the type to `FILE_UPLOAD` and configure:

- `acceptedTypes`: Comma-separated list of MIME types (e.g., "application/pdf,image/\*")
- `maxFileSizeBytes`: Maximum file size in bytes

### Using the Component

```svelte
<FileUploadQuestion
	{question}
	{existingAnswer}
	bind:value={fileId}
	onchange={handleFileChange}
	readonly={false}
/>
```

## Maintenance

### Cleanup Orphaned Files

Run the cleanup script to remove files that are no longer referenced:

```bash
npm run cleanup-files
```

### MinIO Management

Access the MinIO console at `http://localhost:9001` with:

- Username: `minioadmin`
- Password: `minioadmin`

### Backup Strategy

MinIO data is stored in a Docker volume (`minio_data`). For production:

1. Set up regular backups of the MinIO volume
2. Consider using MinIO's built-in replication
3. Implement cross-region backup for disaster recovery

## Production Considerations

### Scaling

- MinIO supports distributed deployment for high availability
- Consider using AWS S3 or other cloud storage for production
- Implement CDN for file delivery

### Monitoring

- Monitor MinIO health and performance
- Track file upload/download metrics
- Set up alerts for storage capacity

### Security

- Use strong credentials for MinIO
- Implement file scanning for malware
- Consider encryption at rest
- Set up proper CORS policies

## Troubleshooting

### Common Issues

1. **Upload fails**: Check MinIO is running and accessible
2. **Download fails**: Verify file exists and user has access
3. **Storage full**: Monitor MinIO disk usage
4. **Permission denied**: Check MinIO credentials and bucket permissions

### Debug Commands

```bash
# Check MinIO status
curl http://localhost:9000/minio/health/live

# Initialize MinIO bucket
npm run init-minio

# Clean up orphaned files
npm run cleanup-files
```
