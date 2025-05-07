<script lang="ts">
	import type { FormQuestion, FormQuestionOption } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined),
		error = $bindable<string | null>(null),
		onchange // Add onchange prop
	}: {
		question: FormQuestion & { options: FormQuestionOption[] };
		existingAnswer: string | null | undefined;
		value?: string | null | undefined;
		error?: string | null;
		onchange?: (value: string | null | undefined) => void; // Add onchange type
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value); // Call onchange when value changes
		}
	});
</script>

<div class="mb-4">
	<fieldset>
		<legend class="mb-2 block text-sm font-medium text-gray-700">
			{question.prompt}
			{#if question.required}<span class="text-red-500">*</span>{/if}
		</legend>

		<div class="space-y-2">
			{#each question.options as option}
				<div class="flex items-center">
					<input
						type="radio"
						id={`${question.id}-${option.id}`}
						name={question.id}
						value={option.id}
						bind:group={value}
						class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<label for={`${question.id}-${option.id}`} class="ml-3 text-sm text-gray-700">
						{option.text}
					</label>
				</div>
			{/each}
		</div>

		{#if error}
			<p class="mt-1 text-sm text-red-600">{error}</p>
		{/if}
	</fieldset>
</div>
