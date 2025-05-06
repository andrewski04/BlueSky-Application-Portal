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
	import FormSection from '$lib/components/application/FormSection.svelte'; // Assuming a wrapper component for section
	import type {
		FormSection as PrismaFormSection,
		FormQuestion,
		FormQuestionOption,
		Answer,
		AnswerOptionSelection
	} from '@prisma/client';

	const { data }: { data: PageData } = $props();

	// Explicitly type existingAnswers to include selectedOptions
	const { section, existingAnswers } = data;

	// Cast existingAnswers to any as a workaround for type issues
	const existingAnswersAny = existingAnswers as any[];

	// Function to find the existing answer for a given question
	function findExistingAnswer(questionId: string) {
		return existingAnswersAny.find((answer) => answer.questionId === questionId);
	}
</script>

<FormSection {section}>
	<form method="POST" use:enhance>
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
</FormSection>
