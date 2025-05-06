<script lang="ts">
	import type { FormQuestion } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined)
	}: {
		question: FormQuestion;
		existingAnswer: number | null | undefined;
		value?: number | null | undefined;
	} = $props();

	// TODO: Implement min/max value restrictions and validation
</script>

<div>
	<label for={question.id}>{question.prompt}</label>
	<input
		type="number"
		id={question.id}
		name={question.id}
		bind:value
		required={question.required}
		min={question.minValue ?? undefined}
		max={question.maxValue ?? undefined}
	/>
</div>
