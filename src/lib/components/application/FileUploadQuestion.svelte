<script lang="ts">
	import type { QuestionVersion, QuestionOption } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined),
		onchange,
		readonly = false,
		adminPreview = false
	}: {
		question: QuestionVersion & { required: boolean };
		existingAnswer: string | null | undefined;
		value?: string | null | undefined;
		onchange?: (value: string | null | undefined) => void;
		readonly?: boolean;
		adminPreview?: boolean;
	} = $props();

	let uploading = $state(false);
	let uploadProgress = $state(0);
	let uploadError: string | null = $state(null);
	let selectedFile: File | null = $state(null);
	let existingFileInfo: { filename: string; sizeBytes: number; mimeType: string } | null =
		$state(null);
	let initialLoad = $state(true);

	$effect(() => {
		if (onchange && !initialLoad) {
			onchange(value);
		}
		initialLoad = false;
	});

	// Load existing file info if we have a file ID
	$effect(() => {
		if (value && !existingFileInfo) {
			loadExistingFileInfo();
		}
	});

	// Also load file info when existingAnswer changes (for initial load)
	$effect(() => {
		if (existingAnswer && !existingFileInfo) {
			loadExistingFileInfo();
		}
	});

	async function loadExistingFileInfo() {
		const fileId = value || existingAnswer;
		if (!fileId) return;

		try {
			const response = await fetch(`/api/upload/${fileId}/info`);
			if (response.ok) {
				existingFileInfo = await response.json();
			}
		} catch (err) {
			console.error('Failed to load file info:', err);
		}
	}

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		selectedFile = file;
		uploadError = null;

		// Validate file size
		if (question.maxFileSizeBytes && file.size > question.maxFileSizeBytes) {
			uploadError = `File size exceeds limit of ${question.maxFileSizeBytes} bytes`;
			return;
		}

		// Validate file type
		if (question.acceptedTypes) {
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
				uploadError = `File type ${file.type} (${fileExtension}) is not accepted. Accepted types: ${question.acceptedTypes}`;
				return;
			}
			if (adminPreview) {
				uploadError = `File type accepted, but will not be uploaded in admin preview.`;
				return;
			}
		}

		// Auto-upload the file
		await uploadFile(file);
	}

	async function uploadFile(file: File) {
		uploading = true;
		uploadProgress = 0;
		uploadError = null;

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('questionId', question.id);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Upload response:', response.status, errorText);
				throw new Error(`Upload failed: ${response.status}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Upload failed');
			}

			value = result.fileUpload.id;
			existingFileInfo = {
				filename: result.fileUpload.filename,
				sizeBytes: result.fileUpload.sizeBytes,
				mimeType: result.fileUpload.mimeType
			};
			selectedFile = null;
			uploadProgress = 100;
		} catch (err) {
			console.error('Upload error:', err);
			uploadError = err instanceof Error ? err.message : 'Upload failed';
			selectedFile = null;
		} finally {
			uploading = false;
		}
	}

	async function deleteFile() {
		if (!value) return;

		try {
			const response = await fetch(`/api/upload/${value}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				value = null;
				existingFileInfo = null;
				uploadError = null;
			} else {
				throw new Error('Failed to delete file');
			}
		} catch (err) {
			uploadError = 'Failed to delete file';
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="mb-4">
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>

	<!-- Hidden input for form submission -->
	<input type="hidden" name={question.id} value={value || ''} />

	{#if readonly}
		<div class="mt-1 text-sm text-gray-700">
			{#if (value || existingAnswer) && existingFileInfo}
				<div class="flex items-center space-x-2">
					<span class="text-blue-600">📎</span>
					<span>{existingFileInfo.filename}</span>
					<span class="text-gray-500">({formatFileSize(existingFileInfo.sizeBytes)})</span>
					<a
						href="/api/download/{value || existingAnswer}"
						class="text-blue-600 underline hover:text-blue-800"
						target="_blank"
					>
						Download
					</a>
				</div>
			{:else if value || existingAnswer}
				<div class="flex items-center space-x-2">
					<span class="text-blue-600">📎</span>
					<span>File uploaded (ID: {value || existingAnswer})</span>
					<a
						href="/api/download/{value || existingAnswer}"
						class="text-blue-600 underline hover:text-blue-800"
						target="_blank"
					>
						Download
					</a>
				</div>
			{:else}
				<span class="text-gray-500">No file uploaded.</span>
			{/if}
		</div>
	{:else}
		{#if (value || existingAnswer) && existingFileInfo}
			<!-- Existing file display -->
			<div class="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-2">
						<span class="text-blue-600">📎</span>
						<div>
							<div class="font-medium">{existingFileInfo.filename}</div>
							<div class="text-sm text-gray-500">
								{formatFileSize(existingFileInfo.sizeBytes)} • {existingFileInfo.mimeType}
							</div>
						</div>
					</div>
					<div class="flex space-x-2">
						<a
							href="/api/download/{value || existingAnswer}"
							class="text-sm text-blue-600 underline hover:text-blue-800"
							target="_blank"
						>
							Download
						</a>
						<button
							type="button"
							onclick={deleteFile}
							class="text-sm text-red-600 underline hover:text-red-800"
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- File upload input -->
			<input
				type="file"
				id={question.id}
				name={question.id}
				accept={question.acceptedTypes ?? undefined}
				multiple={false}
				onchange={handleFileSelect}
				disabled={uploading}
				class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-700 focus:ring-blue-700 focus:outline-none disabled:opacity-50"
			/>

			{#if uploading}
				<div class="mt-2">
					<div class="flex items-center space-x-2">
						<div class="h-2 flex-1 rounded-full bg-gray-200">
							<div
								class="h-2 rounded-full bg-blue-600 transition-all duration-300"
								style="width: {uploadProgress}%"
							></div>
						</div>
						<span class="text-sm text-gray-600">{uploadProgress}%</span>
					</div>
					<p class="mt-1 text-sm text-gray-600">Uploading...</p>
				</div>
			{/if}

			{#if selectedFile && !uploading}
				<div class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-2">
							<span class="text-blue-600">📎</span>
							<span class="text-sm">{selectedFile.name}</span>
							<span class="text-xs text-gray-500">({formatFileSize(selectedFile.size)})</span>
						</div>
						<button
							type="button"
							onclick={() => {
								selectedFile = null;
								uploadError = null;
							}}
							class="text-sm text-red-600 hover:text-red-800"
						>
							Remove
						</button>
					</div>
				</div>
			{/if}
		{/if}

		{#if uploadError}
			<p class="mt-1 text-sm text-red-600">{uploadError}</p>
		{/if}

		{#if question.acceptedTypes}
			<p class="mt-1 text-sm text-gray-500">Accepted file types: {question.acceptedTypes}</p>
		{/if}
		{#if question.maxFileSizeBytes !== null}
			<p class="mt-1 text-sm text-gray-500">
				Max file size: {formatFileSize(question.maxFileSizeBytes)}
			</p>
		{/if}
	{/if}
</div>
