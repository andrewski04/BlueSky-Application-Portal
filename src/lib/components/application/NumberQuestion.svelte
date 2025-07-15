<script lang="ts">
	import type { QuestionVersion } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined),
		onchange,
		readonly = false,
		error = $bindable<string | null>(null)
	}: {
		question: QuestionVersion & { required: boolean };
		existingAnswer: number | null | undefined;
		value?: number | null | undefined;
		onchange?: (value: number | null | undefined) => void;
		readonly?: boolean;
		error?: string | null;
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value);
		}

		// Validation logic
		error = null;
		if (value !== undefined && value !== null && !readonly) {
			const numValue = typeof value === 'string' ? parseFloat(value) : value;
			if (question.minValue != null && numValue < question.minValue) {
				error = `Must be at least ${question.minValue}.`;
			} else if (question.maxValue != null && numValue > question.maxValue) {
				error = `Must be at most ${question.maxValue}.`;
			}
		}
	});
</script>

<div class="mb-4">
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">
			{value ?? 'N/A'}
		</div>
	{:else}
		<input
			type="number"
			id={question.id}
			name={question.id}
			bind:value
			min={question.minValue ?? undefined}
			max={question.maxValue ?? undefined}
			class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
		/>
	{/if}
	{#if question.minValue !== null || question.maxValue !== null}
		<div class="mt-1 text-xs text-gray-500">
			{#if question.minValue !== null}
				Min: {question.minValue}
			{/if}
			{#if question.minValue !== null && question.maxValue !== null}
				|
			{/if}
			{#if question.maxValue !== null}
				Max: {question.maxValue}
			{/if}
		</div>
	{/if}
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
