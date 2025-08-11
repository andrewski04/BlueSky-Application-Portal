<script lang="ts">
	import type { PageData } from './$types';
	import { debounce } from '$lib/utils/debounce';
	import { applyAction, enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import NProgress from 'nprogress';
	import { addNotif } from '$lib/utils/notify';
	import { getColorSchemeClassName, getColorSchemeColor } from '$lib/utils/colorScheme';
	import { formatPhoneNumber } from '$lib/utils/formatPhoneNumber';
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
	import { readable } from 'svelte/store';

	const { data }: { data: PageData } = $props();

	const {
		applicationWithAnswers,
		isReadOnly,
		readOnlyMessage,
		user,
		isAdminPreview,
		applicationResponse
	} = data;

	// Central state to hold the current value of each answer
	let answers: Record<string, any> = $state({});
	let questionSaveStatus: Record<string, 'Saved' | 'Saving' | 'Unsaved' | 'Unanswered'> = $state(
		{}
	);
	let isInitialLoad = true;

	onMount(() => {
		const initialAnswers: Record<string, any> = {};

		// Initialize last save time
		lastSaveTime = new Date();

		applicationWithAnswers?.sections.forEach((section) => {
			section.questions.forEach((question) => {
				let existingAnswer: any = null;
				switch (question.questionVersion.type) {
					case 'TEXT':
					case 'PARAGRAPH':
						existingAnswer = question.Answer[0]?.valueText;
						break;
					case 'NUMBER':
						existingAnswer = question.Answer[0]?.valueNumber;
						break;
					case 'DATE':
						existingAnswer = question.Answer[0]?.valueDate;
						break;
					case 'CHECKBOX':
						existingAnswer =
							question.Answer[0]?.selectedOptions?.map(
								(opt: { option: { id: string } }) => opt.option.id
							) ?? [];
						break;
					case 'MULTIPLE_CHOICE':
					case 'DROPDOWN':
						existingAnswer = question.Answer[0]?.selectedOptions[0]?.option.id;
						break;
					case 'FILE_UPLOAD':
						existingAnswer = question.Answer[0]?.fileUploadId;
						break;
				}
				// For dropdown questions, if no existing answer, start with empty string to show placeholder
				if (question.questionVersion.type === 'DROPDOWN' && existingAnswer === undefined) {
					initialAnswers[question.questionVersion.id] = '';
				} else {
					initialAnswers[question.questionVersion.id] =
						existingAnswer ?? (question.questionVersion.type === 'CHECKBOX' ? [] : null);
				}

				// Set initial save status based on whether question has an answer
				const hasAnswer =
					existingAnswer !== null &&
					existingAnswer !== undefined &&
					(existingAnswer !== '' || question.questionVersion.type === 'CHECKBOX') &&
					(question.questionVersion.type !== 'CHECKBOX' || existingAnswer.length > 0) &&
					// For dropdown questions, empty string means no selection (placeholder)
					(question.questionVersion.type !== 'DROPDOWN' || existingAnswer !== '');

				questionSaveStatus[question.questionVersion.id] = hasAnswer ? 'Saved' : 'Unanswered';
			});
		});

		answers = initialAnswers;

		// Prevent initial saves on load
		setTimeout(() => {
			isInitialLoad = false;
		}, 500);
	});

	let lastSaveTime = $state<Date | null>(null);
	const minute = minuteClock();

	// Update display every minute to show current time since last save
	function minuteClock() {
		return readable(Date.now(), (set) => {
			const tick = () => set(Date.now());

			// align first tick to the next minute boundary
			const msToNextMinute = 60000 - (Date.now() % 60000);
			const timeout = setTimeout(() => {
				tick();
				const interval = setInterval(tick, 60000);
				// cleanup returns from outer function need access to this:
				(cleanup as any).interval = interval;
			}, msToNextMinute);

			function cleanup() {
				clearTimeout(timeout);
				// @ts-ignore
				if ((cleanup as any).interval) clearInterval((cleanup as any).interval);
			}

			return cleanup;
		});
	}
	// Calculate time since last save
	function getTimeSinceLastSave(nowMs: number): string {
		if (!lastSaveTime) return 'Just now';
		const diffInMinutes = Math.floor((nowMs - lastSaveTime.getTime()) / 60000);
		if (diffInMinutes < 1) return 'Just now';
		if (diffInMinutes === 1) return '1 minute ago';
		return `${diffInMinutes} minutes ago`;
	}

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
				lastSaveTime = new Date(); // Update last save time on successful save
			} else {
				questionSaveStatus[questionVersionId] = 'Unsaved';
				console.error('Failed to save question:', questionVersionId);
				if (user.role === 'ADMIN') {
					addNotif('Admin users cannot save questions.', 'error');
				} else {
					addNotif('Failed to save question. Do not refresh the page.', 'error');
				}
			}
		} catch (error) {
			questionSaveStatus[questionVersionId] = 'Unsaved';
			console.error('Error saving question:', error);
			addNotif('Error saving question.', 'error');
		}
	}

	const debouncedQuestionSubmit = debounce((questionVersionId: string, value: any) => {
		if (!isInitialLoad && !isReadOnly && !isAdminPreview) {
			// For dropdown questions, don't save empty string values (placeholder)
			let questionType = '';
			applicationWithAnswers?.sections.forEach((section) => {
				section.questions.forEach((question) => {
					if (question.questionVersion.id === questionVersionId) {
						questionType = question.questionVersion.type;
					}
				});
			});

			if (questionType === 'DROPDOWN' && value === '') {
				return; // Don't save placeholder values
			}

			saveQuestion(questionVersionId, value);
		}
	}, 1000);

	// update save status and trigger debounced save
	function handleQuestionChange(questionVersionId: string, value: any) {
		if (!isInitialLoad && !isReadOnly && !isAdminPreview) {
			answers[questionVersionId] = value;

			// Find the question to determine its type
			let questionType = '';
			applicationWithAnswers?.sections.forEach((section) => {
				section.questions.forEach((question) => {
					if (question.questionVersion.id === questionVersionId) {
						questionType = question.questionVersion.type;
					}
				});
			});

			// For dropdown questions, empty string means no selection (placeholder)
			if (questionType === 'DROPDOWN' && value === '') {
				questionSaveStatus[questionVersionId] = 'Unanswered';
			} else {
				questionSaveStatus[questionVersionId] = 'Unsaved';
			}

			debouncedQuestionSubmit(questionVersionId, value);
		}
	}

	async function saveAllQuestionsInSection(section: any) {
		if (isReadOnly || isAdminPreview) return;

		const questions = section.questions;

		const savePromises = questions
			.map((question: any) => {
				const questionId = question.questionVersionId;
				const currentValue = answers[questionId];
				// For dropdown questions, don't save empty string values (placeholder)
				if (question.questionVersion.type === 'DROPDOWN' && currentValue === '') {
					return null;
				}
				if (currentValue != undefined && questionSaveStatus[questionId] != 'Unanswered') {
					return saveQuestion(questionId, currentValue);
				}
				return null;
			})
			.filter(Boolean);

		try {
			await Promise.all(savePromises);

			// Update last save time when section is saved
			lastSaveTime = new Date();
			addNotif(`Section "${section.name}" saved successfully`, 'success');
		} catch (error) {
			addNotif(`Error saving section "${section.name}"`, 'error');
			console.error('Error saving one or more questions in the section:', error);
		}
	}
</script>

<svelte:head>
	<title>Application - BlueSky Institute</title>
	<style>
		.secondary-nav {
			background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
			min-height: 1.5rem;
		}

		.secondary-nav::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(
				90deg,
				transparent 0%,
				rgba(255, 255, 255, 0.1) 50%,
				transparent 100%
			);
			animation: shimmer 2s infinite;
		}

		@keyframes shimmer {
			0% {
				transform: translateX(-100%);
			}
			100% {
				transform: translateX(100%);
			}
		}
	</style>
</svelte:head>

{#if applicationWithAnswers}
	<div class="min-h-screen bg-gray-100">
		{#if user.role === 'ADMIN'}
			<AdminNavBar message="Application Form - {applicationWithAnswers.name}" />
		{:else}
			<UserNavBar message="Application Form - {applicationWithAnswers.name}" />
		{/if}

		<!-- Application Status and Last Saved -->
		{#if applicationResponse}
			<section
				class="secondary-nav sticky top-0 z-10 flex justify-center overflow-hidden bg-blue-600 px-1 py-2 shadow-md md:px-3"
			>
				<div class="flex items-center space-x-2 md:space-x-4">
					<div
						class="flex items-center space-x-1 text-[10px] text-white opacity-90 md:space-x-2 md:text-xs"
					>
						<svg
							class="h-3 w-3 md:h-4 md:w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span class="hidden md:inline"
							>Application Status: {applicationResponse?.status === 'DRAFT'
								? 'In Progress'
								: 'Submitted'}</span
						>
					</div>
					<div class="h-3 w-px bg-white opacity-30 md:h-4"></div>
					<div
						class="flex items-center space-x-1 text-[10px] text-white opacity-90 md:space-x-2 md:text-xs"
					>
						<svg
							class="h-3 w-3 md:h-4 md:w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span class="hidden md:inline">Last Saved: {getTimeSinceLastSave($minute)}</span>
					</div>
					<div class="h-3 w-px bg-white opacity-30 md:h-4"></div>
					<div
						class="flex items-center space-x-1 text-[10px] text-white opacity-90 md:space-x-2 md:text-xs"
					>
						<svg
							class="h-3 w-3 md:h-4 md:w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span class="hidden md:inline">
							{#if Object.values(questionSaveStatus).some((status) => status === 'Saving')}
								Saving Answers
							{:else if Object.values(questionSaveStatus).some((status) => status === 'Unsaved')}
								Unsaved Answers
							{:else if Object.values(questionSaveStatus).length > 0}
								All Answers Saved
							{:else}
								Loading...
							{/if}
						</span>
					</div>
				</div>
			</section>
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
							{#if applicationResponse}
								<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
									<div class="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
										<h3 class="mb-2 font-semibold text-blue-800">Contact Information</h3>
										<p class="mb-2 text-sm text-gray-700">
											If you have any questions, please contact:
										</p>
										<p class="font-medium text-blue-700">Haley Wilson</p>
										<p class="text-blue-600">Haley_Wilson@bcbst.com</p>
									</div>

									<div class="rounded-lg border-l-4 border-green-400 bg-green-50 p-6">
										<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
											<!-- Application Details -->
											<div class="space-y-3">
												<h4 class="text-sm font-medium tracking-wide text-green-700 uppercase">
													Application Details
												</h4>
												<div class="space-y-2 text-sm">
													<div class="flex justify-between">
														<span class="text-gray-600">Deadline:</span>
														<span class="font-medium">
															{applicationWithAnswers.closeDate
																? new Date(applicationWithAnswers.closeDate).toLocaleDateString(
																		'en-US',
																		{
																			timeZone: 'UTC'
																		}
																	)
																: 'N/A'}
														</span>
													</div>
													<div class="flex justify-between">
														<span class="text-gray-600">Status:</span>
														<span class="font-medium">
															{#if applicationResponse.status === 'DRAFT'}
																<span
																	class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
																>
																	Draft
																</span>
															{:else}
																<span
																	class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
																>
																	Submitted
																</span>
															{/if}
														</span>
													</div>
												</div>
											</div>

											<!-- Applicant Information -->
											<div class="space-y-3">
												<h4 class="text-sm font-medium tracking-wide text-green-700 uppercase">
													Applicant Information
												</h4>
												<div class="space-y-2 text-sm">
													<div class="flex justify-between">
														<span class="text-gray-600">Name:</span>
														<span class="font-medium">
															{applicationResponse.user.firstName}
															{applicationResponse.user.lastName}
														</span>
													</div>
													<div class="flex justify-between">
														<span class="text-gray-600">Email:</span>
														<span class="font-medium">{applicationResponse.user.email}</span>
													</div>
													<div class="flex justify-between">
														<span class="text-gray-600">Phone:</span>
														<span class="font-medium">
															{applicationResponse.user.phoneNumber
																? formatPhoneNumber(applicationResponse.user.phoneNumber)
																: 'N/A'}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/if}
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
						<div class="{getColorSchemeClassName(section.colorScheme)} mb-6 rounded-lg p-4">
							<h2 class="text-2xl font-bold text-white">
								Section {section.displayOrder + 1}:
								{section.name}
							</h2>
							{#if section.description}
								<p class="text-white">{section.description}</p>
							{/if}
						</div>

						{#each section.questions.map( (q) => ({ required: q.required, answer: q.Answer[0], ...q.questionVersion }) ) as question}
							<div class="relative mb-6">
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
										existingAnswer={question.answer?.selectedOptions?.map(
											(opt: { option: { id: string } }) => opt.option.id
										) ?? []}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'MULTIPLE_CHOICE'}
									<MultipleChoiceQuestion
										onchange={(value) => handleQuestionChange(question.id, value)}
										{question}
										existingAnswer={question.answer?.selectedOptions[0]?.option.id}
										readonly={isReadOnly}
									/>
								{:else if question.type === 'DROPDOWN'}
									<DropdownQuestion
										{question}
										onchange={(value) => handleQuestionChange(question.id, value)}
										existingAnswer={question.answer?.selectedOptions[0]?.option.id}
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
										class:bg-gray-200={questionSaveStatus[question.id] === 'Unanswered'}
										class:text-gray-800={questionSaveStatus[question.id] === 'Unanswered'}
									>
										{questionSaveStatus[question.id]}
									</div>
								{:else if !isReadOnly && !isAdminPreview}
									<div
										class="absolute -top-2 right-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-800"
									>
										Unanswered
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
							use:enhance={({ cancel }) => {
								if (Object.values(questionSaveStatus).some((status) => status === 'Unsaved')) {
									cancel();
									return;
								}
								NProgress.start();
								return async ({ result }) => {
									NProgress.done();
									if (result.type === 'redirect' || result.type === 'success') {
										await applyAction(result);
									} else if (
										result.type === 'failure' &&
										(result.data?.code === 'ERR_VALIDATION_FAILED' ||
											result.data?.code === 'ERR_VALIDATION_FAILED')
									) {
										addNotif(result.data?.error as string, 'error');
									} else {
										addNotif('Error submitting application', 'error');
									}
								};
							}}
						>
							<button
								type="submit"
								class="btn-blue rounded-md px-6 py-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
								disabled={Object.values(questionSaveStatus).some((status) => status === 'Unsaved')}
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
