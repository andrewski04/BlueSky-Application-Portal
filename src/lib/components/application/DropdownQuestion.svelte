<script lang="ts">
	import type { FormQuestion, FormQuestionOption } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined)
	}: {
		question: FormQuestion & { options: FormQuestionOption[] };
		existingAnswer: string | null | undefined;
		value?: string | null | undefined;
	} = $props();
</script>

<div>
	<label for={question.id}>{question.prompt}</label>
	<select id={question.id} name={question.id} bind:value required={question.required}>
		{#each question.options as option}
			<option value={option.id}>{option.text}</option>
		{/each}
	</select>
</div>
