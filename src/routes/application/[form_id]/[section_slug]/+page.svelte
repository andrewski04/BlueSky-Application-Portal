<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { debounce } from '$lib/utils/debounce';
	import { onMount } from 'svelte';
	import nProgress from 'nprogress';

	import UserNavBar from '$lib/components/dashboard/UserNavBar.svelte';

	import CheckboxQuestion from '$lib/components/application/CheckboxQuestion.svelte';
	import DateQuestion from '$lib/components/application/DateQuestion.svelte';
	import DropdownQuestion from '$lib/components/application/DropdownQuestion.svelte';
	import FileUploadQuestion from '$lib/components/application/FileUploadQuestion.svelte';
	import MultipleChoiceQuestion from '$lib/components/application/MultipleChoiceQuestion.svelte';
	import NumberQuestion from '$lib/components/application/NumberQuestion.svelte';
	import ParagraphQuestion from '$lib/components/application/ParagraphQuestion.svelte';
	import TextQuestion from '$lib/components/application/TextQuestion.svelte';

	const { data }: { data: PageData } = $props();

	const { sectionWithAnswers, isReadOnly, readOnlyMessage } = data;

	let saveStatus: 'Saved' | 'Saving' | 'Unsaved' = $state('Saved');

	let isInitialLoad = true;
	let form: HTMLFormElement | null = $state(null);
	let activeElement: Element | null = null;

	// debounce form submission; wait 1 second after last input before submitting
	const debouncedSubmit = debounce(() => {
		// temporary workaround to date cursor position resetting on save
		if (
			document.activeElement instanceof HTMLInputElement &&
			document.activeElement.type === 'date'
		) {
			debouncedSubmit();
			return;
		}
		if (form && !isInitialLoad) {
			form.requestSubmit();
		}
	}, 1000);

	// save on form value changes
	function handleInputChange() {
		if (!isInitialLoad) {
			saveStatus = 'Unsaved';
			debouncedSubmit();
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
	<title>Application - BlueSky Institute</title>
	<style>
		.section-header-blue {
			background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		}
	</style>
</svelte:head>

{#if sectionWithAnswers}
	<div class="min-h-screen bg-gray-100">
		<UserNavBar message="Application Form - {sectionWithAnswers.name}" />
		{#if isReadOnly}
			<p class="text-center text-2xl font-bold">{readOnlyMessage}</p>
		{/if}
		<div class="mx-auto mt-12 max-w-3/4 rounded-lg bg-gray-200 p-6">
			<form
				bind:this={form}
				method="POST"
				action="?/saveSection"
				use:enhance={() => {
					nProgress.start();
					saveStatus = 'Saving';
					activeElement = document.activeElement;

					return async ({ update }) => {
						await update({ reset: false });
						saveStatus = 'Saved';
						nProgress.done();
						if (activeElement && activeElement instanceof HTMLElement) {
							activeElement.focus();
						}
					};
				}}
			>
				<!-- Form Section -->
				<div class="mb-8 rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
					<!-- Section Header -->
					<div class="section-header-blue mb-6 flex items-center justify-between rounded-lg p-4">
						<h2 class="text-2xl font-bold text-white">
							Section {sectionWithAnswers.displayOrder + 1}:
							{sectionWithAnswers.name}
						</h2>
						<div
							class="max-w-fit rounded p-2 text-sm font-semibold"
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
					{#if sectionWithAnswers.description}
						<p class="mb-6 text-gray-700">{sectionWithAnswers.description}</p>
					{/if}

					{#each sectionWithAnswers.questions as question}
						{#if question.type === 'TEXT'}
							<TextQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.valueText}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'PARAGRAPH'}
							<ParagraphQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.valueText}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'NUMBER'}
							<NumberQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.valueNumber}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'DATE'}
							<DateQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.valueDate}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'CHECKBOX'}
							<CheckboxQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.selections.map((opt) => opt.id)}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'MULTIPLE_CHOICE'}
							<MultipleChoiceQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.selections[0]?.id}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'DROPDOWN'}
							<DropdownQuestion
								{question}
								onchange={handleInputChange}
								existingAnswer={question.answer?.selections[0]?.id}
								readonly={isReadOnly}
							/>
						{:else if question.type === 'FILE_UPLOAD'}
							<FileUploadQuestion
								onchange={handleInputChange}
								{question}
								existingAnswer={question.answer?.fileUploadId}
								readonly={isReadOnly}
							/>
						{/if}
					{/each}
					<button
						type="submit"
						class="rounded-md bg-green-600 px-6 py-2 text-white shadow hover:bg-green-700"
						disabled={isReadOnly}
						style:display={isReadOnly ? 'none' : undefined}>Save Section</button
					>
				</div>
			</form>
			<div class="flex justify-end">
				<a
					href="/user/dashboard"
					class="hover:bg-green-70a mr-auto rounded-md bg-green-600 px-6 py-2 text-white shadow"
					>Back to Dashboard</a
				>
				{#if sectionWithAnswers.prevSlug}
					<a
						data-sveltekit-reload
						href="/application/{sectionWithAnswers.formId}/{sectionWithAnswers.prevSlug}"
						class="mr-2 rounded-md bg-red-600 px-6 py-2 text-white shadow hover:bg-red-700"
						>Previous Section</a
					>
				{/if}

				{#if sectionWithAnswers.nextSlug}
					<a
						data-sveltekit-reload
						href="/application/{sectionWithAnswers.formId}/{sectionWithAnswers.nextSlug}"
						class="ml-2 rounded-md bg-blue-600 px-6 py-2 text-white shadow hover:bg-blue-700"
						>Next Section</a
					>
				{:else if !isReadOnly}
					<form method="POST" action="?/submitApplication">
						<button
							type="submit"
							class="ml-2 rounded-md bg-green-600 px-6 py-2 text-white shadow hover:bg-green-700"
							>Submit Application</button
						>
					</form>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<p>Section not found.</p>
{/if}
