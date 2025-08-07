<script lang="ts">
	import type { PageData } from './$types';
	import { debounce } from '$lib/utils/debounce';
	import { applyAction, enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import NProgress from 'nprogress';
	import { addNotif } from '$lib/utils/notify';
	import { getColorSchemeClassName, getColorSchemeColor } from '$lib/utils/colorScheme';

	import UserNavBar from '$lib/components/dashboard/UserNavBar.svelte';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import CheckboxQuestion from '$lib/components/application/CheckboxQuestion.svelte';
	import DateQuestion from '$lib/components/application/DateQuestion.svelte';
	import DropdownQuestion from '$lib/components/application/DropdownQuestion.svelte';
	import FileUploadQuestion from '$lib/components/application/FileUploadQuestion.svelte';
	import MultipleChoiceQuestion from '$lib/components/application/MultipleChoiceQuestion.svelte';
	import NumberQuestion from '$lib/components/application/NumberQuestion.svelte';
	import ParagraphQuestion from '$lib/components/application/ParagraphQuestion.svelte';
	import TextQuestion from '$lib/components/application/TextQuestion.svelte';

	const { data }: { data: PageData } = $props();

	const { applicationWithAnswers, isReadOnly, readOnlyMessage, user, isAdminPreview } = data;

	// Central state to hold the current value of each answer
	let answers: Record<string, any> = $state({});
	let questionSaveStatus: Record<string, 'Saved' | 'Saving' | 'Unsaved'> = $state({});
	let isInitialLoad = true;

	onMount(() => {
		const initialAnswers: Record<string, any> = {};

		applicationWithAnswers?.sections.forEach((section) => {
			section.questions.forEach((question) => {
				let existingAnswer: any = null;
				switch (question.type) {
					case 'TEXT':
					case 'PARAGRAPH':
						existingAnswer = question.answer?.valueText;
						break;
					case 'NUMBER':
						existingAnswer = question.answer?.valueNumber;
						break;
					case 'DATE':
						existingAnswer = question.answer?.valueDate;
						break;
					case 'CHECKBOX':
						existingAnswer =
							question.answer?.selections?.map((opt: { id: string }) => opt.id) ?? [];
						break;
					case 'MULTIPLE_CHOICE':
					case 'DROPDOWN':
						existingAnswer = question.answer?.selections[0]?.id;
						break;
					case 'FILE_UPLOAD':
						existingAnswer = question.answer?.fileUploadId;
						break;
				}
				initialAnswers[question.id] = existingAnswer ?? (question.type === 'CHECKBOX' ? [] : null);
			});
		});

		answers = initialAnswers;

		// Prevent initial saves on load
		setTimeout(() => {
			isInitialLoad = false;
		}, 500);
	});

	// save individual question
	async function saveQuestion(questionVersionId: string, value: any) {
		if (isReadOnly || isAdminPreview) return;

		questionSaveStatus[questionVersionId] = 'Saving';

		const formData = new FormData();
		formData.append('questionVersionId', questionVersionId);

		if (Array.isArray(value)) {
			value.forEach((v) => formData.append('value[]', v));
		} else {
			formData.append('value', value ?? '');
		}

		try {
			const response = await fetch('?/saveQuestion', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				questionSaveStatus[questionVersionId] = 'Saved';
			} else {
				questionSaveStatus[questionVersionId] = 'Unsaved';
				console.error('Failed to save question:', questionVersionId);
				addNotif('Failed to save question', 'error');
			}
		} catch (error) {
			questionSaveStatus[questionVersionId] = 'Unsaved';
			console.error('Error saving question:', error);
			addNotif('Error saving question', 'error');
		}
	}

	const debouncedQuestionSubmit = debounce((questionVersionId: string, value: any) => {
		if (!isInitialLoad && !isReadOnly && !isAdminPreview) {
			saveQuestion(questionVersionId, value);
		}
	}, 1000);

	// update save status and trigger debounced save
	function handleQuestionChange(questionVersionId: string, value: any) {
		if (!isInitialLoad && !isReadOnly && !isAdminPreview) {
			answers[questionVersionId] = value;
			questionSaveStatus[questionVersionId] = 'Unsaved';
			debouncedQuestionSubmit(questionVersionId, value);
		}
	}

	async function saveAllQuestionsInSection(section: any) {
		if (isReadOnly || isAdminPreview) return;

		const questions = section.questions;

		const savePromises = questions.map((question: any) => {
			const questionId = question.id;
			const currentValue = answers[questionId];
			return saveQuestion(questionId, currentValue);
		});

		try {
			await Promise.all(savePromises);
			addNotif(`Section "${section.name}" saved successfully`, 'success');
		} catch (error) {
			addNotif(`Error saving section "${section.name}"`, 'error');
			console.error('Error saving one or more questions in the section:', error);
		}
	}
</script>

<svelte:head>
	<title>Application - BlueSky Institute</title>
</svelte:head>

{#if applicationWithAnswers}
	<div class="min-h-screen bg-gray-100">
		{#if user.role === 'ADMIN'}
			<AdminNavBar message="Application Form - {applicationWithAnswers.name}" />
		{:else}
			<UserNavBar message="Application Form - {applicationWithAnswers.name}" />
		{/if}

		<div class="mx-auto p-3 md:p-6 xl:max-w-3/4">
			<div class=" mx-auto rounded-lg bg-gray-200 p-3 shadow-lg md:p-6">
				<!-- Application Information -->
				<div class="mb-8 rounded-lg border-t-4 border-blue-600 bg-white p-8 shadow-lg">
					<div class="flex flex-col items-center gap-6 lg:flex-row">
						<div class="flex-1 text-center">
							{#if isReadOnly || isAdminPreview}
								<div class="mx-auto mb-4 w-fit rounded-lg bg-red-50 p-4 shadow-md">
									<p class="text-center text-2xl font-bold text-red-600">{readOnlyMessage}</p>
								</div>
							{/if}
							<h1 class="mb-4 text-3xl font-bold text-gray-800">{applicationWithAnswers.name}</h1>

							{#if applicationWithAnswers.description}
								<h2 class="mb-4 text-xl font-semibold text-blue-600">
									{applicationWithAnswers.description}
								</h2>
							{/if}

							<!-- Contact and Deadline Information -->
							<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
									<h3 class="mb-2 font-semibold text-blue-800">Contact Information</h3>
									<p class="mb-2 text-sm text-gray-700">
										If you have any questions, please contact:
									</p>
									<p class="font-medium text-blue-700">Haley Wilson</p>
									<p class="text-blue-600">Haley_Wilson@bcbst.com</p>
								</div>

								<div class="rounded-lg border-l-4 border-green-400 bg-green-50 p-4">
									<h3 class="mb-2 font-semibold text-green-800">Application Information</h3>
									<div class="space-y-1 text-sm">
										<p></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{#each applicationWithAnswers.sections as section}
					<!-- Form Section -->
					<div
						class="mb-8 rounded-lg border-l-4 bg-white p-6 shadow-md"
						style:border-color={getColorSchemeColor(section.colorScheme)}
					>
						<!-- Section Header -->
						<div
							class="{getColorSchemeClassName(
								section.colorScheme
							)} flex items-center justify-between rounded-lg py-4"
						>
							<h2 class="pl-4 text-2xl font-bold text-white">
								Section {section.displayOrder + 1}:
								{section.name}
							</h2>
						</div>
						{#if section.description}
							<p class="mb-6 text-gray-700">{section.description}</p>
						{/if}

						{#each section.questions as question}
							<div class="relative">
								{#if question.type === 'TEXT'}
									<TextQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.valueText}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'PARAGRAPH'}
									<ParagraphQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.valueText}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'NUMBER'}
									<NumberQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.valueNumber}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'DATE'}
									<DateQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.valueDate}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'CHECKBOX'}
									<CheckboxQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.selections?.map(
											(opt: { id: string }) => opt.id
										) ?? []}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'MULTIPLE_CHOICE'}
									<MultipleChoiceQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.selections[0]?.id}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'DROPDOWN'}
									<DropdownQuestion
										{question}
										onchange={(value) => handleQuestionChange(question.id, value)}
										existingAnswer={question.answer?.selections[0]?.id}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'FILE_UPLOAD'}
									<FileUploadQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.fileUploadId}
										readonly={isReadOnly}
										adminPreview={isAdminPreview}
									/>
								{/if}

								<!-- Individual question save status indicator -->
								{#if questionSaveStatus[question.id] && !isReadOnly && !isAdminPreview}
									<div
										class="absolute -top-2 right-2 rounded-full px-2 py-1 text-xs font-semibold"
										class:bg-green-200={questionSaveStatus[question.id] === 'Saved'}
										class:text-green-800={questionSaveStatus[question.id] === 'Saved'}
										class:bg-yellow-200={questionSaveStatus[question.id] === 'Saving'}
										class:text-yellow-800={questionSaveStatus[question.id] === 'Saving'}
										class:bg-red-200={questionSaveStatus[question.id] === 'Unsaved'}
										class:text-red-800={questionSaveStatus[question.id] === 'Unsaved'}
									>
										{questionSaveStatus[question.id]}
									</div>
								{:else if !isReadOnly && !isAdminPreview}
									<div
										class="absolute -top-2 right-2 rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800"
									>
										Saved
									</div>
								{/if}
							</div>
						{/each}
						<button
							type="button"
							onclick={() => saveAllQuestionsInSection(section)}
							class="btn-green rounded-md px-6 py-2 text-white shadow hover:bg-green-700"
							disabled={isReadOnly || isAdminPreview}
							style:display={isReadOnly || isAdminPreview ? 'none' : undefined}>Save Section</button
						>
					</div>
				{/each}
				{#if !isReadOnly && !isAdminPreview}
					<div class="flex justify-end space-x-4 rounded-lg bg-white p-6 shadow-md">
						<form
							method="POST"
							action="?/submitApplication"
							use:enhance={() => {
								NProgress.start();
								return async ({ result }) => {
									NProgress.done();
									await applyAction(result);
								};
							}}
						>
							<button type="submit" class="btn-blue rounded-md px-6 py-2 shadow"
								>Submit Application</button
							>
						</form>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-100">
		<div class=" mx-auto rounded-lg bg-gray-200 p-3 text-center shadow-lg md:p-6">
			<h1 class="text-2xl font-bold">Application Form Not Found</h1>
			<p>The application form you are looking for does not exist.</p>
		</div>
	</div>
{/if}
