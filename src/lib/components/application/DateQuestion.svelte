<script lang="ts">
	import type { FormQuestion } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(
			existingAnswer instanceof Date ? existingAnswer.toISOString().split('T')[0] : undefined
		)
	}: {
		question: FormQuestion;
		existingAnswer: Date | null | undefined;
		value?: string | null | undefined;
	} = $props();

	// TODO: Implement min/max date restrictions and validation
</script>

<div class="mb-4">
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>
	<input
		type="date"
		id={question.id}
		name={question.id}
		bind:value
		required={question.required}
		min={question.minDate?.toISOString().split('T')[0] ?? undefined}
		max={question.maxDate?.toISOString().split('T')[0] ?? undefined}
		class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
	/>
</div>
