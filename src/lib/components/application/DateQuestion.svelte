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

<div>
	<label for={question.id}>{question.prompt}</label>
	<input
		type="date"
		id={question.id}
		name={question.id}
		bind:value
		required={question.required}
		min={question.minDate?.toISOString().split('T')[0] ?? undefined}
		max={question.maxDate?.toISOString().split('T')[0] ?? undefined}
	/>
</div>
