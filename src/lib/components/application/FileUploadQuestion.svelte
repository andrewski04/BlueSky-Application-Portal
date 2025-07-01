<script lang="ts">
	import type { QuestionVersion, QuestionOption } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined),
		onchange,
		readonly = false
	}: {
		question: QuestionVersion & { required: boolean };
		existingAnswer: string | null | undefined;
		value?: string | null | undefined;
		onchange?: (value: string | null | undefined) => void;
		readonly?: boolean;
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value);
		}
	});
</script>

<div class="mb-4">
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt} <b>(File uploads not yet supported)</b>
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>
	<input
		type="file"
		id={question.id}
		name={question.id}
		bind:value
		accept={question.acceptedTypes ?? undefined}
		multiple={false}
		class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
	/>
	{#if question.acceptedTypes}
		<p class="mt-1 text-sm text-gray-500">Accepted file types: {question.acceptedTypes}</p>
	{/if}
	{#if question.maxFileSizeBytes !== null}
		<p class="mt-1 text-sm text-gray-500">Max file size: {question.maxFileSizeBytes} bytes</p>
	{/if}

	{#if existingAnswer}
		<p class="mt-1 text-sm text-gray-500">Existing file ID: {existingAnswer}</p>
		<!-- TODO: Display existing file name or link -->
	{/if}

	{#if readonly}
		<div class="mt-1 text-sm text-gray-700">
			{#if existingAnswer}
				Existing file ID: {existingAnswer}
				<!-- TODO: Display existing file name or link in readonly mode -->
			{:else}
				No file uploaded.
			{/if}
		</div>
	{/if}
</div>
