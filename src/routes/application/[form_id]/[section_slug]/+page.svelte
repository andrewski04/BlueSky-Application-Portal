<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import NProgress from 'nprogress';
	import type { AnswerOptionSelection } from '@prisma/client';
	import { debounce } from '$lib/utils/debounce';
	import { autoSubmit } from '$lib/utils/autoSubmit';
	import { onMount } from 'svelte';

	import CheckboxQuestion from '$lib/components/application/CheckboxQuestion.svelte';
	import { writable } from 'svelte/store';
	import DateQuestion from '$lib/components/application/DateQuestion.svelte';
	import DropdownQuestion from '$lib/components/application/DropdownQuestion.svelte';
	import FileUploadQuestion from '$lib/components/application/FileUploadQuestion.svelte';
	import MultipleChoiceQuestion from '$lib/components/application/MultipleChoiceQuestion.svelte';
	import NumberQuestion from '$lib/components/application/NumberQuestion.svelte';
	import ParagraphQuestion from '$lib/components/application/ParagraphQuestion.svelte';
	import TextQuestion from '$lib/components/application/TextQuestion.svelte';

	const { data }: { data: PageData } = $props();

	const { section, existingAnswers } = data;

	let saveStatus: 'Saved' | 'Saving' | 'Unsaved' = $state('Saved');

	function findExistingAnswer(questionId: string) {
		return existingAnswers.find((answer) => answer.questionId === questionId);
	}

	let isInitialLoad = true;
	let form: HTMLFormElement;
	let activeElement: Element | null = null;

	// debounce form submission; wait 1 second after last input before submitting
	const debouncedSubmit = debounce(() => {
		if (form && !isInitialLoad) {
			console.log('Input changed, auto-submitting form');
			form.requestSubmit();
		}
	}, 500);

	// save on form value changes
	function handleInputChange() {
		activeElement = document.activeElement;
		if (!isInitialLoad) {
			saveStatus = 'Unsaved';
			debouncedSubmit();
		}
	}

	function saveAndNavigate(href: string) {
		if (saveStatus === 'Saved') {
			window.location.href = href;
		} else {
			form.requestSubmit();
			setTimeout(() => {
				window.location.href = href;
			}, 500);
		}
	}

	// prevent initial form submission on page load
	onMount(() => {
		setTimeout(() => {
			isInitialLoad = false;
		}, 1000);
	});
</script>

<svelte:head>
	<title>Application - {section.name}</title>
</svelte:head>

<form
	bind:this={form}
	method="POST"
	action="?/saveSection"
	use:autoSubmit
	use:enhance={() => {
		saveStatus = 'Saving';

		return async ({ update }) => {
			await update({ reset: false });
			saveStatus = 'Saved';
			// dont deselect element on save
			if (activeElement && activeElement instanceof HTMLElement) {
				activeElement.focus();
			}
		};
	}}
	class="h-screen space-y-6 bg-gray-100 p-6"
>
	{#if section}
		<div class="flex items-center justify-between">
			<h2 class="mb-4 text-2xl font-bold">{section.name}</h2>
			<div
				class="rounded p-2 text-sm font-semibold"
				class:bg-green-200={saveStatus === 'Saved'}
				class:text-green-800={saveStatus === 'Saved'}
				class:bg-yellow-200={saveStatus === 'Saving'}
				class:text-yellow-800={saveStatus === 'Saving'}
				class:bg-red-200={saveStatus === 'Unsaved'}
				class:text-red-800={saveStatus === 'Unsaved'}
			>
				{saveStatus}
			</div>
		</div>
		{#if section.description}
			<p class="mb-6 text-gray-700">{section.description}</p>
		{/if}

		{#each section.questions as question}
			{@const existingAnswer = findExistingAnswer(question.id)}
			<div class="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
				{#if question.type === 'TEXT'}
					<TextQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.valueText}
					/>
				{:else if question.type === 'PARAGRAPH'}
					<ParagraphQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.valueText}
					/>
				{:else if question.type === 'NUMBER'}
					<NumberQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.valueNumber}
					/>
				{:else if question.type === 'DATE'}
					<DateQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.valueDate}
					/>
				{:else if question.type === 'CHECKBOX'}
					<CheckboxQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.selectedOptions.map(
							(opt: AnswerOptionSelection) => opt.optionId
						)}
					/>
				{:else if question.type === 'MULTIPLE_CHOICE'}
					<MultipleChoiceQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.selectedOptions[0]?.optionId}
					/>
				{:else if question.type === 'DROPDOWN'}
					<DropdownQuestion
						{question}
						onchange={handleInputChange}
						existingAnswer={existingAnswer?.selectedOptions[0]?.optionId}
					/>
				{:else if question.type === 'FILE_UPLOAD'}
					<FileUploadQuestion
						onchange={handleInputChange}
						{question}
						existingAnswer={existingAnswer?.fileUploadId}
					/>
				{/if}
			</div>
		{/each}

		<div class="flex justify-end">
			{#if section.previousFormSectionSlug}
				<button
					onclick={() =>
						saveAndNavigate(`/application/${section.formId}/${section.previousFormSectionSlug}`)}
					class="mr-2 rounded-md bg-red-600 px-6 py-2 text-white shadow hover:bg-red-700"
					>Previous Section</button
				>
			{/if}
			<button
				type="submit"
				class="rounded-md bg-green-600 px-6 py-2 text-white shadow hover:bg-green-700"
				>Save Section</button
			>
			{#if section.nextFormSectionSlug}
				<button
					onclick={() =>
						saveAndNavigate(`/application/${section.formId}/${section.nextFormSectionSlug}`)}
					class="ml-2 rounded-md bg-blue-600 px-6 py-2 text-white shadow hover:bg-blue-700"
					>Next Section</button
				>
			{/if}
		</div>
	{:else}
		<p>Section not found.</p>
	{/if}
</form>
