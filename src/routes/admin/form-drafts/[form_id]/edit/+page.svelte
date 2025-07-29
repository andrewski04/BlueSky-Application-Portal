<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import DraftQuestionOverview from '$lib/components/form/DraftQuestionOverview.svelte';
	import type { Prisma } from '@prisma/client';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';
	import { slugify } from '$lib/utils/slugify';
	import { onMount } from 'svelte';
	import { deserialize } from '$app/forms';

	type FormSectionWithQuestions = Prisma.FormSectionDraftGetPayload<{
		include: {
			questions: {
				include: {
					questionDraft: { include: { options: true } };
					questionVersion: { include: { options: true } };
				};
			};
		};
	}>;

	import nProgress from 'nprogress';

	let { data }: PageProps = $props();
	let draftForm = $state(data.draftForm);
	let error = $state(data.error);

	// Mutable local copy of the current section
	let currentSectionCopy = $state<FormSectionWithQuestions | null>(null);
	let isSectionSaved = $state(true);
	let questionsCount = $state(0);

	// Question form state
	let questionType = $state('TEXT');
	let questionPrompt = $state('');
	let questionRequired = $state(false);
	let questionOptions = $state<string[]>(['', '']);
	let questionMinLength = $state<number | null>(null);
	let questionMaxLength = $state<number | null>(null);
	let questionMinValue = $state<number | null>(null);
	let questionMaxValue = $state<number | null>(null);
	let questionMinDate = $state<string>('');
	let questionMaxDate = $state<string>('');
	let questionAcceptedTypes = $state('');
	let questionMaxFileSize = $state<number | null>(null);

	// Question selection and edit state
	let selectedQuestion = $state<FormSectionWithQuestions['questions'][0] | null>(null);
	let isEditingQuestion = $state(false);

	// Add a reactive variable for the new section name input
	let newSectionName = $state('');
	let sectionNameError = $state('');
	let editSectionNameError = $state('');

	// Helper to check if a section name already exists
	function sectionNameExists(name: string): boolean {
		if (!draftForm || !draftForm.sections) return false;
		return draftForm.sections.some(
			(s: any) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
		);
	}

	// Watch for changes in newSectionName and validate
	$effect(() => {
		if (newSectionName.trim() && sectionNameExists(newSectionName)) {
			sectionNameError = 'A section with this name already exists.';
		} else {
			sectionNameError = '';
		}
	});

	// Watch for changes in currentSectionCopy?.name and validate for edit
	$effect(() => {
		if (
			currentSectionCopy &&
			currentSectionCopy.name &&
			draftForm &&
			draftForm.sections.some(
				(s: any) =>
					s.name.trim().toLowerCase() === currentSectionCopy?.name.trim().toLowerCase() &&
					s.id !== currentSectionCopy?.id
			)
		) {
			editSectionNameError = 'A section with this name already exists.';
		} else {
			editSectionNameError = '';
		}
	});

	// Helper to generate the next untitled section name
	function getNextUntitledSectionName() {
		const base = 'Untitled Section';
		if (!draftForm || !draftForm.sections) return base;
		const names = draftForm.sections.map((s: any) => s.name);
		let max = 0;
		for (const name of names) {
			if (name === base) {
				max = Math.max(max, 1);
			} else {
				const match = name.match(/^Untitled Section (\d+)$/);
				if (match) {
					max = Math.max(max, parseInt(match[1], 10) + 1);
				}
			}
		}
		if (!names.includes(base)) return base;
		return `${base} ${max}`;
	}

	// Initialize with first section
	onMount(() => {
		if (draftForm?.sections[0]) {
			setCurrentSection(draftForm.sections[0]);
		}
	});

	function setCurrentSection(section: FormSectionWithQuestions | null) {
		resetQuestionForm();
		if (!section) {
			currentSectionCopy = null;
			questionsCount = 0;
			isSectionSaved = true;
			return;
		}

		// Deep clone the section to create a mutable copy
		currentSectionCopy = JSON.parse(JSON.stringify(section));
		questionsCount = currentSectionCopy!.questions.length;
		isSectionSaved = true;
	}

	function checkForChanges() {
		if (!currentSectionCopy || !draftForm) return;

		const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
		if (sectionIndex === -1) return;

		const currentStr = JSON.stringify(currentSectionCopy);
		const originalStr = JSON.stringify(draftForm.sections[sectionIndex]);
		isSectionSaved = currentStr === originalStr;
	}

	// Watch for changes in the current section copy
	$effect(() => {
		if (currentSectionCopy) {
			checkForChanges();
		}
	});

	async function saveSection() {
		if (!currentSectionCopy || !draftForm) return;

		const formData = new FormData();
		formData.append('section', JSON.stringify(currentSectionCopy));

		const response = await fetch('?/updateSection', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			const result = await response.json();
			if (result.type === 'success') {
				// Update the original section in the form
				const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
				if (sectionIndex !== -1) {
					draftForm.sections[sectionIndex] = JSON.parse(JSON.stringify(currentSectionCopy));
				}
				isSectionSaved = true;
				error = '';
			} else {
				error = result.error || 'Error updating section';
			}
		} else {
			error = 'Error updating section, please refresh the page.';
			console.error(error);
		}
	}

	// Helper functions for question form
	function needsOptions(type: string): boolean {
		return ['MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX'].includes(type);
	}

	function needsLengthValidation(type: string): boolean {
		return ['TEXT', 'PARAGRAPH'].includes(type);
	}

	function needsNumberValidation(type: string): boolean {
		return type === 'NUMBER';
	}

	function needsDateValidation(type: string): boolean {
		return type === 'DATE';
	}

	function needsFileValidation(type: string): boolean {
		return type === 'FILE_UPLOAD';
	}

	function addOption() {
		questionOptions = [...questionOptions, ''];
	}

	function removeOption(index: number) {
		if (questionOptions.length > 2) {
			questionOptions = questionOptions.filter((_, i) => i !== index);
		}
	}

	function updateOption(index: number, value: string) {
		questionOptions[index] = value;
		questionOptions = [...questionOptions]; // Trigger reactivity
	}

	function resetQuestionForm() {
		// Reset all form fields
		questionType = 'TEXT';
		questionPrompt = '';
		questionRequired = false;
		questionOptions = ['', ''];
		questionMinLength = null;
		questionMaxLength = null;
		questionMinValue = null;
		questionMaxValue = null;
		questionMinDate = '';
		questionMaxDate = '';
		questionAcceptedTypes = '';
		questionMaxFileSize = null;
		selectedQuestion = null;
		isEditingQuestion = false;
	}

	function selectQuestion(question: FormSectionWithQuestions['questions'][0]) {
		selectedQuestion = question;
		isEditingQuestion = true;

		// Populate form with question data
		const questionData = question.questionDraft || question.questionVersion;
		if (questionData) {
			questionType = questionData.type;
			questionPrompt = questionData.prompt;
			questionRequired = question.required;

			// Reset validation fields
			questionMinLength = questionData.minLength;
			questionMaxLength = questionData.maxLength;
			questionMinValue = questionData.minValue;
			questionMaxValue = questionData.maxValue;
			questionMinDate = questionData.minDate
				? new Date(questionData.minDate).toISOString().split('T')[0]
				: '';
			questionMaxDate = questionData.maxDate
				? new Date(questionData.maxDate).toISOString().split('T')[0]
				: '';
			questionAcceptedTypes = questionData.acceptedTypes || '';
			questionMaxFileSize = questionData.maxFileSizeBytes
				? Math.floor(questionData.maxFileSizeBytes / (1024 * 1024))
				: null;

			// Handle options
			if (questionData.options && questionData.options.length > 0) {
				questionOptions = questionData.options.map((opt: any) => opt.text);
			} else {
				questionOptions = ['', ''];
			}
		}
	}

	async function updateQuestion() {
		if (!selectedQuestion || !currentSectionCopy || !questionPrompt.trim()) return;

		const formData = new FormData();
		formData.append('questionId', selectedQuestion!.questionDraftId);
		formData.append('type', questionType);
		formData.append('prompt', questionPrompt.trim());
		formData.append('required', questionRequired.toString());
		formData.append('slug', slugify(questionPrompt));

		// Add validation fields if applicable
		if (needsLengthValidation(questionType)) {
			if (questionMinLength !== null) formData.append('minLength', questionMinLength.toString());
			if (questionMaxLength !== null) formData.append('maxLength', questionMaxLength.toString());
		}

		if (needsNumberValidation(questionType)) {
			if (questionMinValue !== null) formData.append('minValue', questionMinValue.toString());
			if (questionMaxValue !== null) formData.append('maxValue', questionMaxValue.toString());
		}

		if (needsDateValidation(questionType)) {
			if (questionMinDate) formData.append('minDate', questionMinDate);
			if (questionMaxDate) formData.append('maxDate', questionMaxDate);
		}

		if (needsFileValidation(questionType)) {
			if (questionAcceptedTypes) formData.append('acceptedTypes', questionAcceptedTypes);
			if (questionMaxFileSize !== null)
				formData.append('maxFileSizeBytes', questionMaxFileSize.toString());
		}

		// Add options if applicable
		if (needsOptions(questionType)) {
			const validOptions = questionOptions.filter((opt) => opt.trim() !== '');
			formData.append('options', JSON.stringify(validOptions));
		}

		const response = await fetch('?/updateQuestion', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		if (response.ok) {
			const result = deserialize(await response.text());

			if (result.type === 'success' && result.data) {
				console.log(result.data.question);
				// Update the question in the current section
				if (currentSectionCopy && result.data.question && selectedQuestion) {
					const questionIndex = currentSectionCopy.questions.findIndex(
						(q: any) => q.questionDraftId === selectedQuestion!.questionDraftId
					);

					if (questionIndex !== -1) {
						currentSectionCopy.questions[questionIndex] = result.data
							.question as FormSectionWithQuestions['questions'][0];
					}
				}

				// Also update the original section in the form to keep it in sync
				if (draftForm && selectedQuestion) {
					const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
					if (sectionIndex !== -1) {
						const questionIndex = draftForm.sections[sectionIndex].questions.findIndex(
							(q: any) => q.questionDraftId === selectedQuestion!.questionDraftId
						);
						if (questionIndex !== -1) {
							draftForm.sections[sectionIndex].questions[questionIndex] = result.data
								.question as FormSectionWithQuestions['questions'][0];
						}
					}
				}

				checkForChanges();
				resetQuestionForm();
				error = '';
			} else {
				error = 'Error updating question';
			}
		} else {
			error = 'Error updating question, please try again.';
			console.error(error);
		}
	}

	async function deleteQuestion(question: any) {
		if (!question || !currentSectionCopy) return;

		const formData = new FormData();
		formData.append('questionId', question.questionDraftId);

		const response = await fetch('?/deleteQuestion', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		if (response.ok) {
			const result = deserialize(await response.text());

			if (result.type === 'success') {
				// Remove the question from the current section
				if (currentSectionCopy) {
					currentSectionCopy.questions = currentSectionCopy.questions.filter(
						(q: any) => q.questionDraftId !== question.questionDraftId
					);
					questionsCount = currentSectionCopy.questions.length;
				}

				// Also remove from the original section in the form
				if (draftForm) {
					const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
					if (sectionIndex !== -1) {
						draftForm.sections[sectionIndex].questions = draftForm.sections[
							sectionIndex
						].questions.filter((q: any) => q.questionDraftId !== question.questionDraftId);
					}
				}

				// If we were editing this question, reset the form
				if (selectedQuestion && selectedQuestion.questionDraftId === question.questionDraftId) {
					resetQuestionForm();
				}

				checkForChanges();
				error = '';
			} else {
				error = 'Error deleting question';
			}
		} else {
			error = 'Error deleting question, please try again.';
			console.error(error);
		}
	}

	async function createQuestion() {
		if (!currentSectionCopy || !questionPrompt.trim()) return;

		const formData = new FormData();
		formData.append('sectionId', currentSectionCopy.id);
		formData.append('type', questionType);
		formData.append('prompt', questionPrompt.trim());
		formData.append('required', questionRequired.toString());
		formData.append('slug', slugify(questionPrompt));

		// Add validation fields if applicable
		if (needsLengthValidation(questionType)) {
			if (questionMinLength !== null) formData.append('minLength', questionMinLength.toString());
			if (questionMaxLength !== null) formData.append('maxLength', questionMaxLength.toString());
		}

		if (needsNumberValidation(questionType)) {
			if (questionMinValue !== null) formData.append('minValue', questionMinValue.toString());
			if (questionMaxValue !== null) formData.append('maxValue', questionMaxValue.toString());
		}

		if (needsDateValidation(questionType)) {
			if (questionMinDate) formData.append('minDate', questionMinDate);
			if (questionMaxDate) formData.append('maxDate', questionMaxDate);
		}

		if (needsFileValidation(questionType)) {
			if (questionAcceptedTypes) formData.append('acceptedTypes', questionAcceptedTypes);
			if (questionMaxFileSize !== null)
				formData.append('maxFileSizeBytes', questionMaxFileSize.toString());
		}

		// Add options if applicable
		if (needsOptions(questionType)) {
			const validOptions = questionOptions.filter((opt) => opt.trim() !== '');
			formData.append('options', JSON.stringify(validOptions));
		}

		const response = await fetch('?/createQuestion', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		if (response.ok) {
			const result = deserialize(await response.text());

			if (result.type === 'success' && result.data) {
				// Add the new question to the current section
				if (currentSectionCopy && result.data.question) {
					// Create a completely new section object to trigger reactivity
					const updatedSection = {
						...currentSectionCopy,
						questions: [...currentSectionCopy.questions, result.data.question as any]
					};
					currentSectionCopy = updatedSection;
					questionsCount = currentSectionCopy.questions.length;
				}

				// Also update the original section in the form to keep it in sync
				if (draftForm) {
					const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
					if (sectionIndex !== -1) {
						draftForm.sections[sectionIndex].questions = [
							...draftForm.sections[sectionIndex].questions,
							result.data.question as any
						];
					}
				}

				checkForChanges();
				resetQuestionForm();
				error = '';
			} else {
				error = 'Error creating question';
			}
		} else {
			error = 'Error creating question, please try again.';
			console.error(error);
		}
	}
</script>

{#if draftForm}
	<div class="bg-secondary flex h-screen flex-col">
		<AdminNavBar message={`Editing Draft: ${draftForm.name}`} />

		<div class="flex min-h-0 flex-1 overflow-hidden">
			<!-- Left Sidebar (section navigation)-->
			<div class="w-1/6 overflow-y-auto border-r bg-gray-100 p-4">
				<div class="flex flex-col items-center justify-center gap-4">
					<form
						method="POST"
						action="?/createSection"
						class="flex w-full max-w-md flex-col items-center gap-3"
						use:enhance={({ formElement, formData }) => {
							nProgress.start();
							// If the input is empty or 'Untitled Section', auto-generate the next name
							const input = formElement.querySelector(
								'input[name="name"]'
							) as HTMLInputElement | null;
							if (input && (!input.value.trim() || input.value.trim() === 'Untitled Section')) {
								const newName = getNextUntitledSectionName();
								input.value = newName;
								formData.set('name', newName); // Ensure the correct name is sent
							}
							return async ({ result, update }) => {
								if (result.type === 'success' && result.data) {
									draftForm.sections = [
										...draftForm.sections,
										{
											...(result.data.section as FormSectionWithQuestions),
											questions: []
										}
									];
									setCurrentSection(draftForm.sections[draftForm.sections.length - 1]);
									update();
									nProgress.done();
								}
							};
						}}
					>
						<input
							type="text"
							name="name"
							placeholder="Untitled Section"
							class="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							bind:value={newSectionName}
						/>
						{#if sectionNameError}
							<p class="w-full text-center text-sm text-red-600">{sectionNameError}</p>
						{/if}
						<button
							class="rounded bg-green-500 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-green-600"
							disabled={!!sectionNameError}
						>
							Add Section
						</button>
					</form>
				</div>

				<hr class="my-4 bg-gray-700" />

				<h2 class="mb-2 text-center text-lg font-bold">Sections</h2>
				<div class="space-y-2">
					{#each draftForm.sections as section}
						<div class="flex flex-row justify-between">
							<button
								onclick={() => setCurrentSection(section)}
								class="w-full rounded {currentSectionCopy?.id === section.id
									? 'bg-blue-100'
									: ''} px-3 py-2 text-left hover:bg-blue-100"
							>
								{section.name}
							</button>
							<form
								method="POST"
								action="?/deleteSection"
								use:enhance={() => {
									nProgress.start();
									let isCurrent = false;
									if (currentSectionCopy?.id === section.id) {
										isCurrent = true;
									}
									return async ({ result, update }) => {
										if (result.type === 'success' && result.data) {
											draftForm.sections = draftForm.sections.filter((s) => s.id !== section.id);
											update();
											nProgress.done();
											if (isCurrent) {
												if (draftForm.sections.length > 0) {
													setCurrentSection(draftForm.sections[0]);
												} else {
													setCurrentSection(null);
												}
											}
										}
									};
								}}
							>
								<input type="hidden" name="sectionId" value={section.id} />
								<button
									aria-label="Delete section"
									class="h-full rounded px-3 py-2 text-left hover:bg-red-400"
								>
									<img alt="Delete section" src="/icons/delete.svg" width="30" height="30" />
								</button>
							</form>
						</div>
					{/each}
				</div>
			</div>

			<!-- Main content (center preview) -->
			<div class="flex-1 overflow-y-auto p-6">
				<div class="mb-4 rounded-md bg-white p-4">
					{#if currentSectionCopy == undefined}
						<p class="my-2 text-center text-xl font-bold">
							Select or create a section to get started.
						</p>
					{:else}
						<!-- Save status and button -->
						<div class="mb-4 flex items-center justify-between">
							<div class="flex items-center gap-2">
								{#if isSectionSaved}
									<span class="text-sm text-green-600">✓ Saved</span>
								{:else}
									<span class="text-sm text-orange-600">● Unsaved changes</span>
								{/if}
							</div>
							{#if !isSectionSaved}
								<button
									onclick={saveSection}
									class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
									disabled={!!editSectionNameError}
								>
									Save Section
								</button>
							{/if}
						</div>

						<input
							type="text"
							class="mb-1 w-full text-2xl font-bold"
							bind:value={currentSectionCopy.name}
							placeholder="Enter section title"
						/>
						{#if editSectionNameError}
							<p class="w-full text-center text-sm text-red-600">{editSectionNameError}</p>
						{/if}

						<textarea
							class="text-md w-full resize-none"
							bind:value={currentSectionCopy.description}
							placeholder="Enter section description"
						>
						</textarea>

						{#if error}
							<p class="text-red-500">{error}</p>
						{/if}

						{#each currentSectionCopy.questions as question}
							{#if question}
								<DraftQuestionOverview
									{question}
									isSelected={selectedQuestion?.questionDraftId === question.questionDraftId}
									onSelect={selectQuestion}
									onDelete={deleteQuestion}
								/>
							{/if}
						{/each}
					{/if}
				</div>
			</div>

			<!-- Right Sidebar (question editor) -->
			<div class="w-1/4 overflow-y-auto border-l bg-gray-50 p-4">
				{#if currentSectionCopy}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold">
							{isEditingQuestion ? 'Edit Question' : 'Add Question'}
						</h2>
						{#if isEditingQuestion}
							<button
								onclick={() => resetQuestionForm()}
								class="text-sm text-gray-600 hover:text-gray-800"
							>
								Cancel
							</button>
						{/if}
					</div>

					<label class="mt-2 block">
						<span class="block text-sm font-medium">Question Type</span>
						<select bind:value={questionType} class="mt-1 w-full rounded border p-2">
							{#each Object.entries(QuestionTypeMap) as [key, label]}
								<option value={key}>{label}</option>
							{/each}
						</select>
					</label>

					<label class="mt-2 block">
						<span class="block text-sm font-medium">Prompt</span>
						<input
							type="text"
							bind:value={questionPrompt}
							class="mt-1 w-full rounded border p-2"
							placeholder="Enter question prompt..."
						/>
					</label>

					<!-- Options for multiple choice, dropdown, checkbox -->
					{#if needsOptions(questionType)}
						<div class="mt-2">
							<span class="block text-sm font-medium">Options</span>
							{#each questionOptions as option, index}
								<div class="mb-1 flex gap-2">
									<input
										type="text"
										value={option}
										oninput={(e) => updateOption(index, (e.target as HTMLInputElement).value)}
										class="flex-1 rounded border p-2"
										placeholder="Option {index + 1}"
									/>
									{#if questionOptions.length > 2}
										<button
											type="button"
											onclick={() => removeOption(index)}
											class="rounded px-2 py-1 text-red-600 hover:bg-red-100"
										>
											×
										</button>
									{/if}
								</div>
							{/each}
							<button
								type="button"
								onclick={addOption}
								class="mt-2 text-sm text-blue-600 hover:underline"
							>
								+ Add another option
							</button>
						</div>
					{/if}

					<!-- Length validation for text/paragraph -->
					{#if needsLengthValidation(questionType)}
						<div class="mt-2 grid grid-cols-2 gap-2">
							<label class="block">
								<span class="block text-sm font-medium">Min Length</span>
								<input
									type="number"
									bind:value={questionMinLength}
									class="mt-1 w-full rounded border p-2"
									placeholder="Optional"
								/>
							</label>
							<label class="block">
								<span class="block text-sm font-medium">Max Length</span>
								<input
									type="number"
									bind:value={questionMaxLength}
									class="mt-1 w-full rounded border p-2"
									placeholder="Optional"
								/>
							</label>
						</div>
					{/if}

					<!-- Number validation -->
					{#if needsNumberValidation(questionType)}
						<div class="mt-2 grid grid-cols-2 gap-2">
							<label class="block">
								<span class="block text-sm font-medium">Min Value</span>
								<input
									type="number"
									bind:value={questionMinValue}
									class="mt-1 w-full rounded border p-2"
									placeholder="Optional"
								/>
							</label>
							<label class="block">
								<span class="block text-sm font-medium">Max Value</span>
								<input
									type="number"
									bind:value={questionMaxValue}
									class="mt-1 w-full rounded border p-2"
									placeholder="Optional"
								/>
							</label>
						</div>
					{/if}

					<!-- Date validation -->
					{#if needsDateValidation(questionType)}
						<div class="mt-2 grid grid-cols-2 gap-2">
							<label class="block">
								<span class="block text-sm font-medium">Min Date</span>
								<input
									type="date"
									bind:value={questionMinDate}
									class="mt-1 w-full rounded border p-2"
								/>
							</label>
							<label class="block">
								<span class="block text-sm font-medium">Max Date</span>
								<input
									type="date"
									bind:value={questionMaxDate}
									class="mt-1 w-full rounded border p-2"
								/>
							</label>
						</div>
					{/if}

					<!-- File validation -->
					{#if needsFileValidation(questionType)}
						<div class="mt-2 space-y-2">
							<label class="block">
								<span class="block text-sm font-medium">Accepted File Types</span>
								<input
									type="text"
									bind:value={questionAcceptedTypes}
									class="mt-1 w-full rounded border p-2"
									placeholder="e.g., .pdf,.doc,.docx"
								/>
							</label>
							<label class="block">
								<span class="block text-sm font-medium">Max File Size (MB)</span>
								<input
									type="number"
									bind:value={questionMaxFileSize}
									class="mt-1 w-full rounded border p-2"
									placeholder="Optional"
								/>
							</label>
						</div>
					{/if}

					<!-- Required setting -->
					<label class="mt-2 block">
						<input type="checkbox" bind:checked={questionRequired} class="mr-2" />
						Required
					</label>

					<button
						onclick={isEditingQuestion ? updateQuestion : createQuestion}
						disabled={!questionPrompt.trim()}
						class="mt-2 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{isEditingQuestion ? 'Update Question' : 'Add Question'}
					</button>

					<hr class="my-4" />

					<button class="mt-2 w-full text-center text-blue-500 hover:underline">
						Open Question Library
					</button>
				{:else}
					<p class="text-center text-gray-500">Select a section to add questions</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if !draftForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message="Form draft not found" />

		<p class="mt-12 text-center text-2xl font-bold text-red-700">Error retrieving form draft</p>
	</div>
{/if}
