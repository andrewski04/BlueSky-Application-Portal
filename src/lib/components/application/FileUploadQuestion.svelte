<script lang="ts">
	import type { FormQuestion } from '@prisma/client';

	let {
		question,
		existingAnswer,
		value = $bindable(existingAnswer ?? undefined)
	}: {
		question: FormQuestion;
		existingAnswer: string | null | undefined;
		value?: string | null | undefined;
	} = $props();

	// TODO: Handle file upload logic and display existing file information
</script>

<div>
	<label for={question.id}>{question.prompt}</label>
	<input
		type="file"
		id={question.id}
		name={question.id}
		bind:value
		required={question.required}
		accept={question.acceptedTypes ?? undefined}
		multiple={false}
	/>
	{#if question.acceptedTypes}
		<p>Accepted file types: {question.acceptedTypes}</p>
	{/if}
	{#if question.maxFileSizeBytes !== null}
		<p>Max file size: {question.maxFileSizeBytes} bytes</p>
	{/if}

	{#if existingAnswer}
		<p>Existing file ID: {existingAnswer}</p>
		<!-- TODO: Display existing file name or link -->
	{/if}
</div>
