<script lang="ts">
	import type { FormQuestion, FormQuestionOption } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? [])
	}: {
		question: FormQuestion & { options: FormQuestionOption[] };
		existingAnswer: string[] | null | undefined;
		value?: string[];
	} = $props();

	// TODO: Implement validation (e.g., required)
</script>

<div>
	<label for={question.id}>{question.prompt}</label>
	{#each question.options as option}
		<div>
			<input
				type="checkbox"
				id="{question.id}-{option.id}"
				name={question.id}
				value={option.id}
				bind:group={value}
				required={question.required}
			/>
			<label for="{question.id}-{option.id}">{option.text}</label>
		</div>
	{/each}
</div>
