<script lang="ts">
	import type { FormQuestion } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? ''),
		error = $bindable<string | null>(null),
		onchange // Add onchange prop
	}: {
		question: FormQuestion;
		existingAnswer: string | null | undefined;
		value?: string;
		error?: string | null;
		onchange?: (value: string) => void; // Add onchange type
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value); // Call onchange when value changes
		}
	});
</script>

<div class="mb-4">
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>

	<textarea
		id={question.id}
		name={question.id}
		bind:value
		maxlength={question.maxLength ?? undefined}
		class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
		class:border-red-500={error}
		rows="4"
	></textarea>

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}

	{#if question.maxLength !== null}
		<div class="mt-1 text-xs text-gray-500">
			{value.length}/{question.maxLength} characters
		</div>
	{/if}
</div>
