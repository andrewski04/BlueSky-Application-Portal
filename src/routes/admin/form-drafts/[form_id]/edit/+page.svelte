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
	import Sortable from 'sortablejs';
	import { confirm } from '$lib/utils/confirmModal';

	type FormSectionWithQuestions = Prisma.FormSectionDraftGetPayload<{
		include: {
			questions: {
				include: {
					questionDraft: { include: { options: { include: { questionOptionGroup: true } } } };
					questionVersion: { include: { options: { include: { questionOptionGroup: true } } } };
				};
			};
		};
	}>;

	import nProgress from 'nprogress';

	let { data }: PageProps = $props();
	let draftForm = $state(data.draftForm);
	let error = $state('');

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
	let questionOptionGroups = $state<string[]>(['', '']);

	// Question selection and edit state
	let selectedQuestion = $state<FormSectionWithQuestions['questions'][0] | null>(null);
	let isEditingQuestion = $state(false);

	// Add a reactive variable for the new section name input
	let newSectionName = $state('');
	let sectionNameError = $state('');

	// Drag and drop list divs
	let sectionList = $state<HTMLElement | null>(null);
	let questionList = $state<HTMLElement | null>(null);
	let questionSortable = $state<Sortable | null>(null);

	// Track the currently dragged question for cross-section copying
	let draggedQuestion = $state<FormSectionWithQuestions['questions'][0] | null>(null);
	let draggedQuestionSectionId = $state<string | null>(null);

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
		if (sectionList) {
			Sortable.create(sectionList, {
				animation: 200,
				handle: '.cursor-move',
				delay: 150,
				delayOnTouchOnly: true,
				touchStartThreshold: 3,
				forceFallback: true,
				fallbackOnBody: true,
				onStart: (evt) => {
					// Add visual feedback that dragging has started
					document.body.classList.add('dragging');
				},
				onSort: (evt) => {
					// Remove visual feedback
					document.body.classList.remove('dragging');

					handleSectionReorder(evt);
				},

				dataIdAttr: 'data-id',
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen'
			});
		}

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
		initSortableQuestions();
	}

	type SortableEvent = Sortable.SortableEvent & {
		originalEvent: PointerEvent;
	};

	function initSortableQuestions() {
		if (questionList && currentSectionCopy) {
			// Destroy any existing Sortable instance
			if (questionSortable) {
				questionSortable.destroy();
			}

			// Create new Sortable instance for questions
			questionSortable = Sortable.create(questionList, {
				animation: 200,
				handle: '.question-drag-handle',
				delay: 150,
				delayOnTouchOnly: true,
				touchStartThreshold: 3,
				forceFallback: true,
				fallbackOnBody: true,
				onStart: (evt) => {
					// Add visual feedback that dragging has started
					document.body.classList.add('dragging');
					// Track the currently dragged question
					const questionId = evt.item.getAttribute('data-id');
					if (questionId && currentSectionCopy) {
						draggedQuestion =
							currentSectionCopy.questions.find((q) => q.questionDraftId === questionId) || null;
						draggedQuestionSectionId = currentSectionCopy.id;
					}
				},
				onEnd: (evt) => {
					// Remove visual feedback
					document.body.classList.remove('dragging');

					// Check if the question was dropped on a section list item
					// If evt.to has the section-list-item id, it means the question was dropped on a section
					if (draggedQuestion && draggedQuestionSectionId) {
						const targetSectionId = ((evt as SortableEvent).originalEvent.target as HTMLElement)
							.closest('#section-list-item')
							?.getAttribute('data-id');
						if (targetSectionId && targetSectionId !== draggedQuestionSectionId) {
							// Question was dropped on a different section, copy it
							moveQuestionToSection(draggedQuestion, targetSectionId);
						}
					}

					// Clear the dragged question reference
					draggedQuestion = null;
					draggedQuestionSectionId = null;

					// Handle normal reordering within the same section
					handleQuestionReorder(evt as SortableEvent);
				},

				dataIdAttr: 'data-id',
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen'
			});
		}
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

		const currentStr = JSON.stringify({
			...currentSectionCopy,
			questions: undefined,
			displayOrder: undefined
		});
		const originalStr = JSON.stringify({
			...draftForm.sections[sectionIndex],
			questions: undefined,
			displayOrder: undefined
		});
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
		return [
			'MULTIPLE_CHOICE',
			'DROPDOWN',
			'CHECKBOX',
			'MULTIPLE_CHOICE_GRID',
			'CHECKBOX_GRID'
		].includes(type);
	}

	function needsOptionGroups(type: string): boolean {
		return ['MULTIPLE_CHOICE_GRID', 'CHECKBOX_GRID'].includes(type);
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

	function removeOption(index: number) {
		if (questionOptions.length > 2) {
			questionOptions = questionOptions.filter((_, i) => i !== index);
			if (questionOptions[questionOptions.length - 1] != '') {
				questionOptions = [...questionOptions, ''];
			}
		}
	}

	function updateOption(index: number, value: string) {
		if (questionOptions[index] === '' && value != '' && index === questionOptions.length - 1) {
			questionOptions = [...questionOptions, ''];
		}
		questionOptions[index] = value;
		questionOptions = [...questionOptions]; // Trigger reactivity
	}

	function removeOptionGroup(index: number) {
		if (questionOptionGroups.length > 2) {
			questionOptionGroups = questionOptionGroups.filter((_, i) => i !== index);
			if (questionOptionGroups[questionOptionGroups.length - 1] != '') {
				questionOptionGroups = [...questionOptionGroups, ''];
			}
		}
	}

	function updateOptionGroup(index: number, value: string) {
		if (
			questionOptionGroups[index] === '' &&
			value != '' &&
			index === questionOptionGroups.length - 1
		) {
			questionOptionGroups = [...questionOptionGroups, ''];
		}
		questionOptionGroups[index] = value;
		questionOptionGroups = [...questionOptionGroups]; // Trigger reactivity
	}

	function resetQuestionForm() {
		// Reset all form fields
		questionType = 'TEXT';
		questionPrompt = '';
		questionRequired = false;
		questionOptions = ['', ''];
		questionOptionGroups = ['', ''];
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
		resetQuestionForm();
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
			if (
				questionData.options &&
				questionData.options.length > 0 &&
				!questionData.options[0].questionOptionGroup
			) {
				questionOptions = questionData.options.map((opt: any) => opt.text);
				questionOptions = [...questionOptions, ''];
			} else {
				questionOptions = ['', ''];
			}

			if (
				questionData.options &&
				questionData.options.length > 0 &&
				questionData.options[0].questionOptionGroup
			) {
				const groupSet = new Set<string>();
				const optionSet = new Set<string>();

				for (const opt of questionData.options) {
					if (opt.questionOptionGroup?.text) {
						groupSet.add(opt.questionOptionGroup.text);
					}
					optionSet.add(opt.text);
				}

				questionOptionGroups = Array.from(groupSet);
				questionOptions = Array.from(optionSet);
				questionOptions = [...questionOptions, ''];
				questionOptionGroups = [...questionOptionGroups, ''];
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

		if (needsOptionGroups(questionType)) {
			const validOptionGroups = questionOptionGroups.filter((opt) => opt.trim() !== '');
			formData.append('optionGroups', JSON.stringify(validOptionGroups));
		}

		const response = await fetch('?/updateQuestion', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		const result = deserialize(await response.text());

		if (result.type === 'success' && result.data) {
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

			addNotif('Question updated successfully', 'success');
			checkForChanges();
			resetQuestionForm();
			error = '';
		} else if (result.type === 'failure') {
			error = (result.data?.error as string) || 'Error updating question';
			addNotif(error, 'error');
		} else {
			error = 'An unknown error occurred';
			addNotif(error, 'error');
		}
	}

	async function deleteQuestion(question: any) {
		if (!question || !currentSectionCopy) return;

		if (
			!(await confirm(
				'Are you sure you want to delete this question? This action cannot be undone.',
				'Delete Question',
				'Cancel',
				'Confirm Question Deletion'
			))
		) {
			return;
		}

		const formData = new FormData();
		formData.append('questionId', question.questionDraftId);

		const response = await fetch('?/deleteQuestion', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

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
			addNotif('Question deleted successfully', 'success');
			checkForChanges();
			error = '';
		} else if (result.type === 'failure') {
			error = (result.data?.error as string) || 'Error deleting question';
			addNotif(error, 'error');
		} else {
			error = 'An unknown error occurred';
			addNotif(error, 'error');
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

		if (needsOptionGroups(questionType)) {
			const validOptionGroups = questionOptionGroups.filter((opt) => opt.trim() !== '');
			formData.append('optionGroups', JSON.stringify(validOptionGroups));
		}

		const response = await fetch('?/createQuestion', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

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
			addNotif('Question added successfully', 'success');
			checkForChanges();
			resetQuestionForm();
			error = '';
		} else if (result.type === 'failure') {
			error = (result.data?.error as string) || 'Error creating question';
			addNotif(error, 'error');
			console.error(error);
		} else {
			error = 'An unknown error occurred';
			addNotif(error, 'error');
			console.error(error);
		}
	}

	// Function to copy a question to a new section
	async function moveQuestionToSection(
		questionToCopy: FormSectionWithQuestions['questions'][0],
		targetSectionId: string
	) {
		if (!questionToCopy || !draftForm) return;

		// Validate that the question still exists in the current section
		if (
			!currentSectionCopy?.questions.some(
				(q) => q.questionDraftId === questionToCopy.questionDraftId
			)
		) {
			addNotif('Question no longer exists in this section', 'error');
			return;
		}

		const questionData = questionToCopy.questionDraft || questionToCopy.questionVersion;
		if (!questionData) return;

		// Validate that the target section exists
		if (!draftForm.sections.some((s) => s.id === targetSectionId)) {
			addNotif('Target section not found', 'error');
			return;
		}

		const formData = new FormData();
		formData.append('sectionId', targetSectionId);
		formData.append('questionId', questionToCopy.questionDraftId);

		const response = await fetch('?/moveQuestionToSection', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		const result = deserialize(await response.text());

		if (result.type === 'success' && result.data) {
			// Add the new question to the target section
			if (result.data.question) {
				const targetSectionIndex = draftForm.sections.findIndex((s) => s.id === targetSectionId);
				if (targetSectionIndex !== -1) {
					draftForm.sections[targetSectionIndex].questions = [
						...draftForm.sections[targetSectionIndex].questions,
						result.data.question as any
					];
				}

				// If the target section is currently selected, update the current section copy
				if (currentSectionCopy?.id === targetSectionId) {
					const updatedSection = {
						...currentSectionCopy,
						questions: [...currentSectionCopy.questions, result.data.question as any]
					};
					currentSectionCopy = updatedSection;
					questionsCount = currentSectionCopy.questions.length;
				}
			}

			// Remove the question from the original section in both places
			const sourceSectionId = currentSectionCopy?.id;
			if (sourceSectionId) {
				// Update the source section in draftForm.sections
				const sourceSectionIndex = draftForm.sections.findIndex((s) => s.id === sourceSectionId);
				if (sourceSectionIndex !== -1) {
					draftForm.sections[sourceSectionIndex].questions = draftForm.sections[
						sourceSectionIndex
					].questions.filter((q: any) => q.questionDraftId !== questionToCopy.questionDraftId);
				}

				// Update currentSectionCopy if it's the source section
				if (currentSectionCopy) {
					currentSectionCopy.questions = currentSectionCopy.questions.filter(
						(q: any) => q.questionDraftId !== questionToCopy.questionDraftId
					);
					questionsCount = currentSectionCopy.questions.length;
				}
			}

			// Force reactivity by creating a new reference
			draftForm.sections = [...draftForm.sections];

			addNotif('Question moved successfully', 'success');
			error = '';
		} else if (result.type === 'failure') {
			error = (result.data?.error as string) || 'Error moving question';
			addNotif(error, 'error');
			console.error(error);
		} else {
			error = 'An unknown error occurred while moving question';
			addNotif(error, 'error');
			console.error(error);
		}
	}

	// Sortable event handler for section reordering
	// This function is called when a section is dropped in a new position
	// The evt object contains oldIndex and newIndex properties from Sortable
	async function handleSectionReorder(evt: Sortable.SortableEvent) {
		const { oldIndex, newIndex } = evt;
		if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex || !draftForm)
			return;

		const toEl = evt.to as HTMLElement; // Sortable gives you the container
		const orderIds = Array.from(toEl.querySelectorAll<HTMLElement>('[data-id]'))
			.map((el) => el.dataset.id!)
			.filter(Boolean);
		if (!orderIds.length) return;
		// Build a rank map
		const rank = new Map(orderIds.map((id, i) => [id, i]));

		// Produce a new, immutably updated sections array from IDs
		const reordered = [...draftForm.sections]
			.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!)
			.map((s, i) => ({ ...s, displayOrder: i }));

		draftForm.sections.forEach((section) => {
			section.displayOrder = reordered.findIndex((s) => s.id === section.id);
		});

		// Persist
		const formData = new FormData();
		formData.append(
			'sections',
			JSON.stringify(reordered.map((s) => ({ id: s.id, displayOrder: s.displayOrder })))
		);

		const response = await fetch('?/reorderSections', { method: 'POST', body: formData });
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			addNotif('Sections reordered successfully', 'success');
		} else {
			addNotif('Error reordering sections', 'error');
		}
	}

	async function handleQuestionReorder(evt: SortableEvent) {
		const { oldIndex, newIndex } = evt;

		// Only handle reordering within the same section
		if (
			oldIndex === undefined ||
			newIndex === undefined ||
			oldIndex === newIndex ||
			!currentSectionCopy ||
			!draftForm
		)
			return;

		// Get the questions in their new order from SortableJS
		const toEl = evt.to as HTMLElement;
		const orderIds = Array.from(toEl.querySelectorAll<HTMLElement>('[data-id]'))
			.map((el) => el.dataset.id!)
			.filter(Boolean);

		if (!orderIds.length) return;

		// Build a rank map
		const rank = new Map(orderIds.map((id, i) => [id, i]));

		// Produce a new, immutably updated questions array from IDs
		const reordered = [...currentSectionCopy.questions]
			.sort((a, b) => rank.get(a.questionDraftId)! - rank.get(b.questionDraftId)!)
			.map((q, i) => ({ ...q, displayOrder: i }));

		// Update display orders
		reordered.forEach((question, index) => {
			question.displayOrder = index;
		});

		questionsCount = reordered.length;

		// Also update the original section in the form
		const sectionIndex = draftForm.sections.findIndex((s) => s.id === currentSectionCopy!.id);
		if (sectionIndex !== -1) {
			draftForm.sections[sectionIndex].questions = reordered;
		}

		// Save to server
		const formData = new FormData();
		formData.append(
			'questions',
			JSON.stringify(
				reordered.map((q) => ({ id: q.questionDraftId, displayOrder: q.displayOrder }))
			)
		);

		const response = await fetch('?/reorderQuestions', {
			method: 'POST',
			body: formData
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			addNotif('Questions reordered successfully', 'success');
		} else {
			error = 'Error reordering questions';
			addNotif(error, 'error');
		}
	}
</script>

<svelte:head>
	<title>Edit Form Draft</title>
	<style>
		@import './editor.css';
	</style>
</svelte:head>

{#if draftForm}
	<div class="main-container flex h-screen flex-col">
		<AdminNavBar message={`Editing Draft: ${draftForm.name}`} />

		<div class="flex min-h-0 flex-1 overflow-hidden">
			<!-- Left Sidebar (section navigation)-->
			<div class="w-1/6 overflow-y-auto border-r border-gray-200 bg-gray-100">
				<div class="mt-4 flex flex-row justify-center gap-4 px-1">
					<a
						href={`/admin/form-drafts/${draftForm.id}`}
						class="btn-red flex-shrink-0 px-4 py-2 text-center">Back to Draft</a
					>
					<a
						href={`/application/preview/${draftForm.id}`}
						class="btn-blue flex-shrink-0 px-4 py-2 text-center">Preview Form</a
					>
				</div>

				<hr class="m-4 border-gray-400" />

				<h2 class="mb-2 text-center text-lg font-bold">Sections</h2>
				<div class="space-y-2" bind:this={sectionList}>
					{#each draftForm.sections as section (section.id)}
						<div
							class="draggable-item flex max-w-full flex-row justify-between"
							role="listitem"
							data-id={section.id}
							id="section-list-item"
						>
							<div
								class="flex cursor-move items-center gap-2 rounded-md px-2 text-gray-400 hover:bg-gray-200"
							>
								<svg
									width="20px"
									height="20px"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M5 10H19M14 19L12 21L10 19M14 5L12 3L10 5M5 14H19"
										stroke="#000000"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
							<button
								onclick={() => setCurrentSection(section)}
								class="w-full truncate {currentSectionCopy?.id === section.id
									? 'bg-blue-100'
									: ''} px-3 py-2 text-left hover:bg-blue-100"
							>
								<div class="flex items-center gap-2">
									{section.name}
								</div>
							</button>
							<form
								method="POST"
								action="?/deleteSection"
								use:enhance={async ({ cancel }) => {
									if (
										!(await confirm(
											'Are you sure you want to delete this section? This action cannot be undone.',
											'Delete Section',
											'Cancel',
											'Confirm Section Deletion'
										))
									) {
										cancel();
										return;
									}
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
									class="h-full rounded px-2 text-left hover:bg-red-300"
								>
									<img alt="Delete section" src="/icons/delete.svg" width="30" height="30" />
								</button>
							</form>
						</div>
					{/each}
				</div>
				<div class="flex flex-col items-stretch justify-center gap-4 p-4">
					<form
						method="POST"
						action="?/createSection"
						class="flex w-full max-w-md flex-row items-stretch gap-3"
						use:enhance={({ formElement, formData, cancel }) => {
							nProgress.start();
							// If the input is empty or 'Untitled Section', auto-generate the next name
							const input = formElement.querySelector(
								'input[name="name"]'
							) as HTMLInputElement | null;

							if (newSectionName.trim() && sectionNameExists(newSectionName)) {
								sectionNameError = 'A section with this name already exists.';
								nProgress.done();
								cancel();
							} else {
								sectionNameError = '';
							}

							if (input && (!input.value.trim() || input.value.trim() === 'Untitled Section')) {
								const newName = getNextUntitledSectionName();
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
									addNotif('Section created successfully', 'success');
									nProgress.done();
								} else if (result.type === 'failure') {
									sectionNameError = (result.data?.error as string) || 'Error creating section';
									addNotif(sectionNameError, 'error');
									nProgress.done();
								}
							};
						}}
					>
						<div class="flex flex-1 flex-col gap-2">
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
						</div>
						<button class="btn-green flex h-[42px] w-20 flex-shrink-0 items-center justify-center"
							>Add</button
						>
					</form>
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
					{/if}
					<div class="my-4">
						<div class="space-y-4" bind:this={questionList}>
							{#if currentSectionCopy}
								{#each currentSectionCopy.questions as question (question.questionDraftId)}
									<div class="draggable-item px-4" data-id={question.questionDraftId}>
										<DraftQuestionOverview
											{question}
											isSelected={selectedQuestion?.questionDraftId === question.questionDraftId}
											onSelect={selectQuestion}
											onDelete={deleteQuestion}
										/>
									</div>
								{/each}
								{#if currentSectionCopy.questions.length === 0}
									<p class="text-center text-gray-500">No questions added yet</p>
								{/if}
							{/if}
						</div>
					</div>
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

							<!-- Options for multiple choice, dropdown, checkbox, multiple choice grid, checkbox grid -->
							{#if needsOptions(questionType)}
								<div class="mt-4">
									<span class="mb-2 block text-sm font-medium text-gray-700">Options</span>
									{#each questionOptions as option, index}
										<div class="mb-2 flex max-w-full gap-2">
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
								</div>
							{/if}

							<!-- Option groups for multiple choice grid, checkbox grid -->
							{#if needsOptionGroups(questionType)}
								<div class="mt-4">
									<span class="mb-2 block text-sm font-medium text-gray-700">Rows</span>
									{#each questionOptionGroups as option, index}
										<div class="mb-2 flex max-w-full gap-2">
											<input
												type="text"
												value={option}
												oninput={(e) =>
													updateOptionGroup(index, (e.target as HTMLInputElement).value)}
												class="form-builder-input flex-1 p-2"
												placeholder="Row {index + 1}"
											/>
											{#if questionOptionGroups.length > 2}
												<button
													type="button"
													onclick={() => removeOptionGroup(index)}
													class="rounded px-3 py-2 text-red-600 transition-colors hover:bg-red-100"
												>
													×
												</button>
											{/if}
										</div>
									{/each}
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
						</div>

						<!-- 
						<div class="question-editor-card p-4">
							<button
								class="w-full text-center font-medium text-blue-600 transition-colors hover:text-blue-800"
							>
								Open Question Library
							</button>
						</div> -->
					</div>
					<div class="sticky bottom-0 flex flex-row gap-2 pt-2">
						{#if isEditingQuestion}
							<button
								onclick={createQuestion}
								disabled={!questionPrompt.trim()}
								class="btn-blue w-4/6 p-1 font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
							>
								Copy Question
							</button>
							<button
								onclick={updateQuestion}
								disabled={!questionPrompt.trim()}
								class="btn-green w-full font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
							>
								Save Question
							</button>
						{:else}
							<button
								onclick={createQuestion}
								disabled={!questionPrompt.trim()}
								class="btn-blue w-full font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
							>
								Add Question
							</button>
						{/if}
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
