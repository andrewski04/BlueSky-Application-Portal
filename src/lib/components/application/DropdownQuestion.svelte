<script lang="ts">
	import type { FormQuestion, FormQuestionOption } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined),
		onchange // Add onchange prop
	}: {
		question: FormQuestion & { options: FormQuestionOption[] };
		existingAnswer: string | null | undefined;
		value?: string | null | undefined;
		onchange?: (value: string | null | undefined) => void; // Add onchange type
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
	<select
		id={question.id}
		name={question.id}
		bind:value
		class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
	>
		{#each question.options as option}
			<option value={option.id}>{option.text}</option>
		{/each}
	</select>
</div>
