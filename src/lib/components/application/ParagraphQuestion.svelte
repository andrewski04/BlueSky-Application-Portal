<script lang="ts">
	import type { QuestionVersion } from '@prisma/client';

	let {
		question,
		required,
		existingAnswer,
		value = $bindable(existingAnswer ?? ''),
		error = $bindable<string | null>(null),
		onchange,
		readonly = false
	}: {
		question: QuestionVersion;
		required: boolean;
		existingAnswer: string | null | undefined;
		value?: string;
		error?: string | null;
		onchange?: (value: string) => void;
		readonly?: boolean;
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value);
		}

		// Validation logic
		error = null;
		if (value !== '' && !readonly) {
			if (question.minLength != null && value.length < question.minLength) {
				error = `Must be at least ${question.minLength} characters.`;
			} else if (question.maxLength != null && value.length > question.maxLength) {
				error = `Must be at most ${question.maxLength} characters.`;
			}
		}
	});
</script>

<div>
	<label for={question.id} class="mb-1 block max-w-11/12 text-sm font-medium text-gray-700">
		{question.prompt}
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>

	{#if readonly}
		<div
			class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 break-words whitespace-pre-wrap text-gray-700"
		>
			{value || 'N/A'}
		</div>
	{:else}
		<textarea
			id={question.id}
			name={question.id}
			bind:value
			maxlength={question.maxLength ?? undefined}
			class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
			class:border-red-500={error}
			rows="4"
		></textarea>
	{/if}

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}

	{#if question.minLength !== null || question.maxLength !== null}
		<div class="mt-1 text-xs text-gray-500">
			{#if question.minLength !== null}
				Min: {question.minLength} characters
			{/if}
			{#if question.minLength !== null && question.maxLength !== null}
				|
			{/if}
			{#if question.maxLength !== null}
				{value.length}/{question.maxLength} characters
			{/if}
		</div>
	{/if}
</div>
