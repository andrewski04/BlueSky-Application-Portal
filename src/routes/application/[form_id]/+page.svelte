<script lang="ts">
	import type { PageData } from './$types';
	import { debounce } from '$lib/utils/debounce';
	import { onMount } from 'svelte';

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

	const { applicationWithAnswers, isReadOnly, readOnlyMessage } = data;

	let questionSaveStatus: Record<string, 'Saved' | 'Saving' | 'Unsaved'> = $state({});

	let isInitialLoad = true;

	// debounce individual question submission; wait 1 second after last input before submitting
	const debouncedQuestionSubmit = debounce((questionVersionId: string, value: any) => {
		// temporary workaround to date cursor position resetting on save
		if (
			document.activeElement instanceof HTMLInputElement &&
			document.activeElement.type === 'date'
		) {
			debouncedQuestionSubmit(questionVersionId, value);
			return;
		}

		if (!isInitialLoad && !isReadOnly) {
			saveQuestion(questionVersionId, value);
		}
	}, 1000);

	// save individual question
	async function saveQuestion(questionVersionId: string, value: any) {
		if (isReadOnly) return;

		questionSaveStatus[questionVersionId] = 'Saving';
		questionSaveStatus = questionSaveStatus; // trigger reactivity

		const formData = new FormData();
		formData.append('questionVersionId', questionVersionId);
		formData.append('value', value);

		try {
			const response = await fetch('?/saveQuestion', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				questionSaveStatus[questionVersionId] = 'Saved';
				questionSaveStatus = questionSaveStatus; // trigger reactivity
			} else {
				questionSaveStatus[questionVersionId] = 'Unsaved';
				questionSaveStatus = questionSaveStatus; // trigger reactivity
				console.error('Failed to save question:', questionVersionId);
			}
		} catch (error) {
			questionSaveStatus[questionVersionId] = 'Unsaved';
			questionSaveStatus = questionSaveStatus; // trigger reactivity
			console.error('Error saving question:', error);
		}
	}

	// save individual question on change
	function handleQuestionChange(questionVersionId: string, value: any) {
		if (!isInitialLoad && !isReadOnly) {
			questionSaveStatus[questionVersionId] = 'Unsaved';
			questionSaveStatus = questionSaveStatus; // trigger reactivity
			debouncedQuestionSubmit(questionVersionId, value);
		}
	}

	// save all unsaved questions in a section
	async function saveAllQuestionsInSection(section: any) {
		if (isReadOnly) return;

		const unsavedQuestions = section.questions.filter(
			(question: any) => questionSaveStatus[question.id] === 'Unsaved'
		);

		if (unsavedQuestions.length === 0) {
			return;
		}

		// Save all unsaved questions in parallel
		const savePromises = unsavedQuestions.map(async (question: any) => {
			questionSaveStatus[question.id] = 'Saving';
			questionSaveStatus = questionSaveStatus; // trigger reactivity

			// Get the current value for this question
			let value: any;

			// This is a simplified approach - in a real implementation, you might want to
			// track the current values more explicitly or get them from the DOM
			switch (question.type) {
				case 'TEXT':
				case 'PARAGRAPH':
					value =
						(
							document.querySelector(
								`input[name="${question.id}"], textarea[name="${question.id}"]`
							) as HTMLInputElement | HTMLTextAreaElement
						)?.value || '';
					break;
				case 'NUMBER':
					value =
						(document.querySelector(`input[name="${question.id}"]`) as HTMLInputElement)?.value ||
						null;
					break;
				case 'DATE':
					value =
						(document.querySelector(`input[name="${question.id}"]`) as HTMLInputElement)?.value ||
						null;
					break;
				case 'CHECKBOX':
					const checkboxes = document.querySelectorAll(
						`input[name="${question.id}"]:checked`
					) as NodeListOf<HTMLInputElement>;
					value = Array.from(checkboxes).map((cb) => cb.value);
					break;
				case 'MULTIPLE_CHOICE':
				case 'DROPDOWN':
					value =
						(
							document.querySelector(
								`input[name="${question.id}"]:checked, select[name="${question.id}"]`
							) as HTMLInputElement | HTMLSelectElement
						)?.value || null;
					break;
				case 'FILE_UPLOAD':
					value =
						(document.querySelector(`input[name="${question.id}"]`) as HTMLInputElement)?.value ||
						null;
					break;
				default:
					value = null;
			}

			return saveQuestion(question.id, value);
		});

		try {
			await Promise.all(savePromises);
		} catch (error) {
			console.error('Error saving questions:', error);
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

{#if applicationWithAnswers}
	<div class="min-h-screen bg-gray-100">
		<UserNavBar message="Application Form - {applicationWithAnswers.name}" />
		<div class="mx-auto p-3 md:p-6 xl:max-w-3/4">
			<div class=" mx-auto rounded-lg bg-gray-200 p-3 shadow-lg md:p-6">
				{#if isReadOnly}
					<p class="text-center text-2xl font-bold">{readOnlyMessage}</p>
				{/if}
				<!-- Application Information -->
				<div class="mb-8 rounded-lg border-t-4 border-blue-600 bg-white p-8 shadow-lg">
					<div class="flex flex-col items-center gap-6 lg:flex-row">
						<div class="flex-1 text-center">
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
									<p class="text-sm text-gray-700">If you have any questions, please contact:</p>
									<p class="font-medium text-blue-700">Haley Wilson</p>
									<p class="text-blue-600">Haley_Wilson@bcbst.com</p>
								</div>

								<div class="rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
									<h3 class="mb-2 font-semibold text-red-800">Application Deadlines</h3>
									<div class="space-y-1 text-sm">
										<p>
											<span class="font-medium text-red-700">Early Application Deadline:</span> November
											15, 2024
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{#each applicationWithAnswers.sections as section}
					<!-- Form Section -->
					<div class="mb-8 rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
						<!-- Section Header -->
						<div class="section-header-blue mb-6 flex items-center justify-between rounded-lg p-4">
							<h2 class="text-2xl font-bold text-white">
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
										existingAnswer={question.answer?.selections.map(
											(opt: { id: string }) => opt.id
										)}
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
									/>
								{/if}

								<!-- Individual question save status indicator -->
								{#if questionSaveStatus[question.id]}
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
								{/if}
							</div>
						{/each}
						<button
							type="button"
							onclick={() => saveAllQuestionsInSection(section)}
							class="btn-green rounded-md px-6 py-2 text-white shadow hover:bg-green-700"
							disabled={isReadOnly}
							style:display={isReadOnly ? 'none' : undefined}>Save Section</button
						>
					</div>
				{/each}
				<div class="flex justify-end space-x-4 rounded-lg bg-white p-6 shadow-md">
					{#if !isReadOnly}
						<form method="POST" action="?/submitApplication">
							<button type="submit" class="btn-blue rounded-md px-6 py-2 shadow"
								>Submit Application</button
							>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
