<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import DraftQuestionOverview from '$lib/components/form/DraftQuestionOverview.svelte';
	import type { Prisma, ColorScheme } from '@prisma/client';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';
	import { slugify } from '$lib/utils/slugify';
	import { colorSchemeOptions } from '$lib/utils/colorScheme';
	import { onMount } from 'svelte';
	import { deserialize } from '$app/forms';
	import { getColorSchemeClassName, getColorSchemeColor } from '$lib/utils/colorScheme';
	import { addNotif } from '$lib/utils/notify';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

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

	// Drag and drop state
	let draggedSection = $state<FormSectionWithQuestions | null>(null);
	let draggedQuestion = $state<FormSectionWithQuestions['questions'][0] | null>(null);
	let dragOverSection = $state<string | null>(null);
	let dragOverQuestion = $state<string | null>(null);

	// Add a reactive variable for the new section name input
	let newSectionName = $state('');
	let sectionNameError = $state('');

	// Helper to check if a section name already exists
	function sectionNameExists(name: string): boolean {
		if (!draftForm || !draftForm.sections) return false;
		return draftForm.sections.some(
			(s: any) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
		);
	}

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
			const sectionId = page.url.searchParams.get('sectionId');
			let paramSection = draftForm.sections.find((s) => s.id === sectionId);
			if (paramSection) {
				setCurrentSection(paramSection);
			} else {
				setCurrentSection(draftForm.sections[0]);
			}
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
		updateSearchParams('sectionId', currentSectionCopy!.id);
	}

	function updateSearchParams(key: string, value: string) {
		const newUrl = new URL(page.url);
		newUrl.searchParams.set(key, value);
		goto(newUrl.toString());
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
		nProgress.start();
		if (!currentSectionCopy || !draftForm) return;

		const formData = new FormData();
		formData.append(
			'section',
			JSON.stringify({
				id: currentSectionCopy.id,
				name: currentSectionCopy.name,
				description: currentSectionCopy.description,
				colorScheme: currentSectionCopy.colorScheme,
				displayOrder: currentSectionCopy.displayOrder
			})
		);

		const response = await fetch('?/updateSection', {
			method: 'POST',
			body: formData
		});
		const result = deserialize(await response.text());

		if (result.type === 'success') {
			// Update the original section in the form
			const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
			if (sectionIndex !== -1) {
				draftForm.sections[sectionIndex] = JSON.parse(JSON.stringify(currentSectionCopy));
			}
			isSectionSaved = true;
			error = '';
		} else if (result.type === 'failure') {
			error = (result.data?.error as string) || 'Error updating section';
			addNotif(error, 'error');
		}
		nProgress.done();
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

	// Drag and drop functions
	function handleSectionDragStart(e: DragEvent, section: FormSectionWithQuestions) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', section.id);
			draggedSection = section;
		}
	}

	function handleSectionDragOver(e: DragEvent, sectionId: string) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverSection = sectionId;
	}

	function handleSectionDragLeave(e: DragEvent) {
		e.preventDefault();
		dragOverSection = null;
	}

	async function handleSectionDrop(e: DragEvent, targetSectionId: string) {
		e.preventDefault();
		dragOverSection = null;

		if (!draggedSection || draggedSection.id === targetSectionId) {
			draggedSection = null;
			return;
		}

		// Reorder sections
		if (!draftForm) {
			draggedSection = null;
			return;
		}
		const sections = [...draftForm.sections];
		const draggedIndex = sections.findIndex((s) => s.id === draggedSection!.id);
		const targetIndex = sections.findIndex((s) => s.id === targetSectionId);

		if (draggedIndex === -1 || targetIndex === -1) {
			draggedSection = null;
			return;
		}

		// Remove dragged section and insert at target position
		const [draggedItem] = sections.splice(draggedIndex, 1);
		sections.splice(targetIndex, 0, draggedItem);

		// Update display orders
		sections.forEach((section, index) => {
			section.displayOrder = index;
		});

		// Update local state
		draftForm.sections = sections;

		// Update currentSectionCopy to reference the reordered section
		if (currentSectionCopy) {
			const updatedSection = sections.find((s) => s.id === currentSectionCopy!.id);
			if (updatedSection) {
				currentSectionCopy = JSON.parse(JSON.stringify(updatedSection));
			}
		}

		// Save to server
		const formData = new FormData();
		formData.append(
			'sections',
			JSON.stringify(sections.map((s) => ({ id: s.id, displayOrder: s.displayOrder })))
		);

		const response = await fetch('?/reorderSections', {
			method: 'POST',
			body: formData
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			addNotif('Sections reordered successfully', 'success');
			draggedSection = null;
		} else {
			error = 'Error reordering sections';
			addNotif(error, 'error');
			draggedSection = null;
		}

		draggedSection = null;
	}

	function handleQuestionDragStart(
		e: DragEvent,
		question: FormSectionWithQuestions['questions'][0]
	) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', question.questionDraftId);
			draggedQuestion = question;
			selectQuestion(question);
		}
	}

	function handleQuestionDragOver(e: DragEvent, questionId: string) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverQuestion = questionId;
	}

	function handleQuestionDragLeave(e: DragEvent) {
		e.preventDefault();
		dragOverQuestion = null;
	}

	async function handleQuestionDrop(e: DragEvent, targetQuestionId: string) {
		e.preventDefault();
		dragOverQuestion = null;

		if (
			!draggedQuestion ||
			!currentSectionCopy ||
			draggedQuestion.questionDraftId === targetQuestionId
		) {
			draggedQuestion = null;
			return;
		}

		// Reorder questions within the current section
		const questions = [...currentSectionCopy.questions];
		const draggedIndex = questions.findIndex(
			(q) => q.questionDraftId === draggedQuestion!.questionDraftId
		);
		const targetIndex = questions.findIndex((q) => q.questionDraftId === targetQuestionId);

		if (draggedIndex === -1 || targetIndex === -1) {
			draggedQuestion = null;
			return;
		}

		// Remove dragged question and insert at target position
		const [draggedItem] = questions.splice(draggedIndex, 1);
		questions.splice(targetIndex, 0, draggedItem);

		// Update display orders
		questions.forEach((question, index) => {
			question.displayOrder = index;
		});

		// Update local state
		currentSectionCopy.questions = questions;
		questionsCount = questions.length;

		// Also update the original section in the form
		if (draftForm) {
			const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
			if (sectionIndex !== -1) {
				draftForm.sections[sectionIndex].questions = questions;
			}
		}

		// Save to server
		const formData = new FormData();
		formData.append(
			'questions',
			JSON.stringify(
				questions.map((q) => ({ id: q.questionDraftId, displayOrder: q.displayOrder }))
			)
		);

		const response = await fetch('?/reorderQuestions', {
			method: 'POST',
			body: formData
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			addNotif('Questions reordered successfully', 'success');
			draggedQuestion = null;
		} else {
			error = 'Error reordering questions';
			addNotif(error, 'error');
			draggedQuestion = null;
		}

		draggedQuestion = null;
	}
</script>

<svelte:head>
	<title>Edit Form Draft</title>
	<style>
		.form-builder-card {
			background: linear-gradient(
				135deg,
				rgba(255, 255, 255, 0.95) 0%,
				rgba(248, 250, 252, 0.9) 100%
			);
			box-shadow:
				0 8px 32px rgba(59, 130, 246, 0.1),
				0 4px 16px rgba(0, 0, 0, 0.05);
			border: 1px solid rgba(59, 130, 246, 0.1);
			backdrop-filter: blur(10px);
			border-radius: 16px;
		}

		.question-editor-card {
			background: linear-gradient(
				135deg,
				rgba(255, 255, 255, 0.95) 0%,
				rgba(248, 250, 252, 0.9) 100%
			);

			border: 1px solid rgba(59, 130, 246, 0.1);
			backdrop-filter: blur(10px);
			border-radius: 16px;
		}

		.form-builder-input {
			background: rgba(255, 255, 255, 0.8);
			border-radius: 8px;
		}

		.form-builder-input:focus {
			background: rgba(255, 255, 255, 1);
			box-shadow: 0 0 0 2px rgba(173, 173, 173, 0.5);
		}

		.draggable-item:hover {
			transform: translateY(-1px);
		}

		.draggable-item:active {
			transform: translateY(0);
		}

		.drag-over {
			border: 2px dashed rgba(59, 130, 246, 0.5);
			border-radius: 8px;
		}
	</style>
</svelte:head>

{#if draftForm}
	<div class="main-container flex h-screen flex-col">
		<AdminNavBar message={`Editing Draft: ${draftForm.name}`} />

		<div class="flex min-h-0 flex-1 overflow-hidden">
			<!-- Left Sidebar (section navigation)-->
			<div class="w-1/6 overflow-y-auto border-r border-gray-200 bg-gray-100 p-4">
				<div class="flex flex-col items-center justify-center gap-4">
					<form
						method="POST"
						action="?/createSection"
						class="flex w-full max-w-md flex-col items-center gap-3"
						use:enhance={({ formElement, formData, cancel }) => {
							nProgress.start();
							// If the input is empty or 'Untitled Section', auto-generate the next name
							const input = formElement.querySelector(
								'input[name="name"]'
							) as HTMLInputElement | null;

							if (newSectionName.trim() && sectionNameExists(newSectionName)) {
								sectionNameError = 'A section with this name already exists.';
								cancel();
								nProgress.done();
							} else {
								sectionNameError = '';
							}

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
								} else if (result.type === 'failure') {
									sectionNameError = (result.data?.error as string) || 'Error creating section';
									addNotif(sectionNameError, 'error');
									nProgress.done();
								}
							};
						}}
					>
						<input
							type="text"
							name="name"
							maxlength={50}
							placeholder="Untitled Section"
							class="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							bind:value={newSectionName}
							oninput={() => {
								sectionNameError = '';
							}}
						/>
						{#if sectionNameError}
							<p class="rounded-md bg-red-100 px-2 py-1 text-center text-sm text-red-800">
								{sectionNameError}
							</p>
						{/if}
						<button class="btn-green px-4 py-2"> Add Section </button>
					</form>
				</div>

				<hr class="my-4 border-gray-400" />

				<h2 class="mb-2 text-center text-lg font-bold">Sections</h2>
				<p class="mb-3 text-center text-xs text-gray-500">Drag to reorder sections</p>
				<div class="space-y-2">
					{#each draftForm.sections as section}
						<div
							class="draggable-item flex flex-row justify-between {dragOverSection === section.id
								? 'drag-over'
								: ''}"
							draggable="true"
							role="listitem"
							ondragstart={(e) => handleSectionDragStart(e, section)}
							ondragover={(e) => handleSectionDragOver(e, section.id)}
							ondragleave={handleSectionDragLeave}
							ondrop={(e) => handleSectionDrop(e, section.id)}
						>
							<button
								onclick={() => setCurrentSection(section)}
								class="w-full truncate {currentSectionCopy?.id === section.id
									? 'bg-blue-100'
									: ''} cursor-move px-3 py-2 text-left hover:bg-blue-100"
							>
								<div class="flex items-center gap-2">
									{section.name}
								</div>
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
			<div class="flex-1 overflow-y-auto p-8">
				<div class="form-builder-card mb-4 rounded-md">
					{#if currentSectionCopy == undefined}
						<p class="my-2 text-center text-xl font-bold">
							Select or create a section to get started.
						</p>
					{:else}
						<div
							class="{currentSectionCopy.questions.length > 0
								? 'rounded-t-lg'
								: 'rounded-lg'} {getColorSchemeClassName(currentSectionCopy.colorScheme)}"
						>
							<div class="bg-white/10 p-4">
								<!-- Save status and button -->
								<div class="mb-2 flex items-center justify-between">
									<div class="flex items-center gap-2">
										{#if isSectionSaved}
											<span class="text-md rounded-md bg-green-100 px-2 py-1 text-green-600"
												>✓ Section Saved</span
											>
										{:else}
											<span class=" text-md rounded-md bg-red-100 px-2 py-1 text-red-600"
												>● Unsaved changes</span
											>
										{/if}
									</div>
									{#if error}
										<p class="rounded-md bg-red-100 px-2 py-1 text-red-800">{error}</p>
									{/if}

									{#if !isSectionSaved}
										<button
											disabled={currentSectionCopy.name === ''}
											onclick={saveSection}
											class="btn-green text-md px-4 py-1"
										>
											Save Section
										</button>
									{/if}
								</div>

								<!-- Title and Color in a row -->
								<div class="mb-4 flex flex-row items-stretch gap-4">
									<!-- Title input -->
									<div class="flex-1">
										<input
											type="text"
											class="form-builder-input w-full px-3 py-1 text-2xl font-bold outline-none"
											bind:value={currentSectionCopy.name}
											placeholder="Enter section title"
											maxlength={50}
											oninput={() => {
												error = '';
											}}
										/>
									</div>

									<!-- Color selection -->
									<div class="w-48">
										<select
											bind:value={currentSectionCopy.colorScheme}
											class="form-builder-input h-max w-full cursor-pointer resize-none px-3 py-2 outline-none"
										>
											{#each colorSchemeOptions as option}
												<option
													value={option.value}
													style={'color: ' + getColorSchemeColor(option.value)}
												>
													{option.label}
												</option>
											{/each}
										</select>
									</div>
								</div>

								<textarea
									class="text-md form-builder-input w-full resize-none px-3 py-1 outline-none"
									bind:value={currentSectionCopy.description}
									placeholder="Enter section description"
									maxlength={1000}
								>
								</textarea>
							</div>
						</div>
						<div class="my-4">
							<p class="mb-3 text-center text-sm text-gray-500">Drag questions to reorder them.</p>
							<div class="space-y-4">
								{#each currentSectionCopy.questions as question}
									{#if question}
										<div class="px-4">
											<div
												class="draggable-item {dragOverQuestion === question.questionDraftId
													? 'drag-over'
													: ''}"
												draggable="true"
												role="listitem"
												ondragstart={(e) => handleQuestionDragStart(e, question)}
												ondragover={(e) => handleQuestionDragOver(e, question.questionDraftId)}
												ondragleave={handleQuestionDragLeave}
												ondrop={(e) => handleQuestionDrop(e, question.questionDraftId)}
											>
												<DraftQuestionOverview
													{question}
													isSelected={selectedQuestion?.questionDraftId ===
														question.questionDraftId}
													onSelect={selectQuestion}
													onDelete={deleteQuestion}
												/>
											</div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Right Sidebar (question editor) -->
			<div class="flex w-1/4 flex-col border-l border-gray-200 bg-gray-100 p-4">
				{#if currentSectionCopy}
					<!-- Question editor content - takes up available space -->
					<div class="flex-1 overflow-y-auto">
						<div class="question-editor-card mb-4 p-4">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="text-lg font-semibold text-gray-800">
									{isEditingQuestion ? 'Editing Question' : 'Add Question'}
								</h2>
								{#if isEditingQuestion}
									<button
										onclick={() => resetQuestionForm()}
										class="btn-red px-2 py-1 text-sm transition-colors"
									>
										Cancel
									</button>
								{/if}
							</div>

							<label class="mt-4 block">
								<span class="mb-1 block text-sm font-medium text-gray-700">Question Type</span>
								<select bind:value={questionType} class="form-builder-input w-full p-2">
									{#each Object.entries(QuestionTypeMap) as [key, label]}
										<option value={key}>{label}</option>
									{/each}
								</select>
							</label>

							<label class="mt-4 block">
								<span class="mb-1 block text-sm font-medium text-gray-700">Prompt</span>
								<input
									type="text"
									bind:value={questionPrompt}
									class="form-builder-input w-full p-2"
									placeholder="Enter question prompt..."
								/>
							</label>

							<!-- Options for multiple choice, dropdown, checkbox -->
							{#if needsOptions(questionType)}
								<div class="mt-4">
									<span class="mb-2 block text-sm font-medium text-gray-700">Options</span>
									{#each questionOptions as option, index}
										<div class="mb-2 flex gap-2">
											<input
												type="text"
												value={option}
												oninput={(e) => updateOption(index, (e.target as HTMLInputElement).value)}
												class="form-builder-input flex-1 p-2"
												placeholder="Option {index + 1}"
											/>
											{#if questionOptions.length > 2}
												<button
													type="button"
													onclick={() => removeOption(index)}
													class="rounded px-3 py-2 text-red-600 transition-colors hover:bg-red-100"
												>
													×
												</button>
											{/if}
										</div>
									{/each}
									<button
										type="button"
										onclick={addOption}
										class="text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
									>
										+ Add another option
									</button>
								</div>
							{/if}

							<!-- Length validation for text/paragraph -->
							{#if needsLengthValidation(questionType)}
								<div class="mt-4 grid grid-cols-2 gap-3">
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700">Min Length</span>
										<input
											type="number"
											bind:value={questionMinLength}
											class="form-builder-input w-full p-2"
											placeholder="Optional"
										/>
									</label>
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700">Max Length</span>
										<input
											type="number"
											bind:value={questionMaxLength}
											class="form-builder-input w-full p-2"
											placeholder="Optional"
										/>
									</label>
								</div>
							{/if}

							<!-- Number validation -->
							{#if needsNumberValidation(questionType)}
								<div class="mt-4 grid grid-cols-2 gap-3">
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700">Min Value</span>
										<input
											type="number"
											bind:value={questionMinValue}
											class="form-builder-input w-full p-2"
											placeholder="Optional"
										/>
									</label>
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700">Max Value</span>
										<input
											type="number"
											bind:value={questionMaxValue}
											class="form-builder-input w-full p-2"
											placeholder="Optional"
										/>
									</label>
								</div>
							{/if}

							<!-- Date validation -->
							{#if needsDateValidation(questionType)}
								<div class="mt-4 grid grid-cols-2 gap-3">
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700">Min Date</span>
										<input
											type="date"
											bind:value={questionMinDate}
											class="form-builder-input w-full p-2"
										/>
									</label>
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700">Max Date</span>
										<input
											type="date"
											bind:value={questionMaxDate}
											class="form-builder-input w-full p-2"
										/>
									</label>
								</div>
							{/if}

							<!-- File validation -->
							{#if needsFileValidation(questionType)}
								<div class="mt-4 space-y-3">
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700"
											>Accepted File Types</span
										>
										<input
											type="text"
											bind:value={questionAcceptedTypes}
											class="form-builder-input w-full p-2"
											placeholder="e.g., .pdf,.doc,.docx"
										/>
									</label>
									<label class="block">
										<span class="mb-1 block text-sm font-medium text-gray-700"
											>Max File Size (MB)</span
										>
										<input
											type="number"
											bind:value={questionMaxFileSize}
											class="form-builder-input w-full p-2"
											placeholder="Optional"
										/>
									</label>
								</div>
							{/if}

							<!-- Required setting -->
							<label class="mt-4 flex items-center">
								<input
									type="checkbox"
									bind:checked={questionRequired}
									class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm font-medium text-gray-700">Required</span>
							</label>

							<button
								onclick={isEditingQuestion ? updateQuestion : createQuestion}
								disabled={!questionPrompt.trim()}
								class="btn-blue mt-6 w-full font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isEditingQuestion ? 'Update Question' : 'Add Question'}
							</button>
						</div>

						<div class="question-editor-card p-4">
							<button
								class="w-full text-center font-medium text-blue-600 transition-colors hover:text-blue-800"
							>
								Open Question Library
							</button>
						</div>
					</div>

					<!-- Preview Form button - positioned at bottom -->
					<div class="mt-4 flex justify-center">
						<a href={`/application/preview/${draftForm.id}`} class="btn-blue">Preview Form</a>
					</div>
				{:else}
					<div class="flex flex-1 items-center justify-center">
						<div class="form-builder-card p-8 text-center">
							<p class="text-gray-500">Select a section to add questions</p>
						</div>
					</div>
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
