<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import CheckboxQuestion from '$lib/components/application/CheckboxQuestion.svelte';
	import DateQuestion from '$lib/components/application/DateQuestion.svelte';
	import DropdownQuestion from '$lib/components/application/DropdownQuestion.svelte';
	import FileUploadQuestion from '$lib/components/application/FileUploadQuestion.svelte';
	import MultipleChoiceQuestion from '$lib/components/application/MultipleChoiceQuestion.svelte';
	import NumberQuestion from '$lib/components/application/NumberQuestion.svelte';
	import ParagraphQuestion from '$lib/components/application/ParagraphQuestion.svelte';
	import TextQuestion from '$lib/components/application/TextQuestion.svelte';

	import type { AnswerOptionSelection } from '@prisma/client';

	const { data }: { data: PageData } = $props();

	const { section, existingAnswers } = data;

	function findExistingAnswer(questionId: string) {
		return existingAnswers.find((answer) => answer.questionId === questionId);
	}
</script>

<form method="POST" action="?/saveSection" use:enhance>
	{#if section}
		<h2>{section.name}</h2>
		{#if section.description}
			<p>{section.description}</p>
		{/if}

		{#each section.questions as question}
			{@const existingAnswer = findExistingAnswer(question.id)}
			{#if question.type === 'TEXT'}
				<TextQuestion {question} existingAnswer={existingAnswer?.valueText} />
			{:else if question.type === 'PARAGRAPH'}
				<ParagraphQuestion {question} existingAnswer={existingAnswer?.valueText} />
			{:else if question.type === 'NUMBER'}
				<NumberQuestion {question} existingAnswer={existingAnswer?.valueNumber} />
			{:else if question.type === 'DATE'}
				<DateQuestion {question} existingAnswer={existingAnswer?.valueDate} />
			{:else if question.type === 'CHECKBOX'}
				<CheckboxQuestion
					{question}
					existingAnswer={existingAnswer?.selectedOptions.map(
						(opt: AnswerOptionSelection) => opt.optionId
					)}
				/>
			{:else if question.type === 'MULTIPLE_CHOICE'}
				<MultipleChoiceQuestion
					{question}
					existingAnswer={existingAnswer?.selectedOptions[0]?.optionId}
				/>
			{:else if question.type === 'DROPDOWN'}
				<DropdownQuestion
					{question}
					existingAnswer={existingAnswer?.selectedOptions[0]?.optionId}
				/>
			{:else if question.type === 'FILE_UPLOAD'}
				<FileUploadQuestion {question} existingAnswer={existingAnswer?.fileUploadId} />
			{/if}
		{/each}

		<button type="submit">Save Section</button>
	{:else}
		<p>Section not found.</p>
	{/if}
</form>
