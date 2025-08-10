<script lang="ts">
	import type { QuestionVersion } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(
			existingAnswer instanceof Date ? existingAnswer.toISOString().split('T')[0] : undefined
		),
		onchange,
		readonly = false,
		error = $bindable<string | null>(null)
	}: {
		question: QuestionVersion & { required: boolean };
		existingAnswer: Date | null | undefined;
		value?: string | null | undefined;
		onchange?: (value: string | null | undefined) => void;
		readonly?: boolean;
		error?: string | null;
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value);
		}

		// Validation logic
		error = null;
		if (value && !readonly) {
			const dateValue = new Date(value);
			if (question.minDate && dateValue < new Date(question.minDate)) {
				error = `Date must be on or after ${new Date(question.minDate).toLocaleDateString('en-US', {
					timeZone: 'UTC'
				})}.`;
			} else if (question.maxDate && dateValue > new Date(question.maxDate)) {
				error = `Date must be on or before ${new Date(question.maxDate).toLocaleDateString(
					'en-US',
					{
						timeZone: 'UTC'
					}
				)}.`;
			}
		}
	});
</script>

<div>
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">
			{value || 'N/A'}
		</div>
	{:else}
		<input
			type="date"
			id={question.id}
			name={question.id}
			bind:value
			min={question.minDate?.toISOString().split('T')[0] ?? undefined}
			max={question.maxDate?.toISOString().split('T')[0] ?? undefined}
			class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
		/>
		{#if question.minDate != null || question.maxDate != null}
			<div class="mt-1 text-xs text-gray-500">
				{#if question.minDate != null}
					Min: {question.minDate
						? new Date(question.minDate).toLocaleDateString('en-US', { timeZone: 'UTC' })
						: ''}
				{/if}
				{#if question.minDate != null && question.maxDate != null}
					|
				{/if}
				{#if question.maxDate != null}
					Max: {question.maxDate
						? new Date(question.maxDate).toLocaleDateString('en-US', { timeZone: 'UTC' })
						: ''}
				{/if}
			</div>
		{/if}
	{/if}
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
