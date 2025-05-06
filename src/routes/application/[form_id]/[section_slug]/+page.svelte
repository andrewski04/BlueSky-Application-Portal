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

<form
	method="POST"
	action="?/saveSection"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
	class="h-screen space-y-6 bg-gray-100 p-6"
>
	{#if section}
		<h2 class="mb-4 text-2xl font-bold">{section.name}</h2>
		{#if section.description}
			<p class="mb-6 text-gray-700">{section.description}</p>
		{/if}

		{#each section.questions as question}
			{@const existingAnswer = findExistingAnswer(question.id)}
			<div class="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
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
			</div>
		{/each}

		<div class="flex justify-end">
			{#if section.previousFormSectionSlug}
				<a
					data-sveltekit-reload
					href={`/application/${section.formId}/${section.previousFormSectionSlug}`}
					class="mr-2 rounded-md bg-red-600 px-6 py-2 text-white shadow hover:bg-red-700"
					>Previous Section</a
				>
			{/if}
			<button
				type="submit"
				class="rounded-md bg-green-600 px-6 py-2 text-white shadow hover:bg-green-700"
				>Save Section</button
			>
			{#if section.nextFormSectionSlug}
				<a
					data-sveltekit-reload
					href={`/application/${section.formId}/${section.nextFormSectionSlug}`}
					class="ml-2 rounded-md bg-blue-600 px-6 py-2 text-white shadow hover:bg-blue-700"
					>Next Section</a
				>
			{/if}
		</div>
	{:else}
		<p>Section not found.</p>
	{/if}
</form>
