<script lang="ts">
	import type { QuestionVersion, QuestionOption } from '@prisma/client';

	let {
		question,
		required,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined),
		onchange,
		readonly = false
	}: {
		question: QuestionVersion & { options: QuestionOption[] };
		required: boolean;
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

<div>
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		{@const selectedOption = question.options.find((opt) => opt.id === value)}
		<div class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">
			{selectedOption ? selectedOption.text : 'N/A'}
		</div>
	{:else}
		<select
			id={question.id}
			name={question.id}
			bind:value
			class="w-full rounded-md border border-blue-600 px-3 py-2 shadow-sm focus:border-blue-700 focus:ring-blue-700 focus:outline-none"
		>
			<option value="">Choose answer</option>
			{#each question.options as option}
				<option value={option.id}>{option.text}</option>
			{/each}
		</select>
	{/if}
</div>
