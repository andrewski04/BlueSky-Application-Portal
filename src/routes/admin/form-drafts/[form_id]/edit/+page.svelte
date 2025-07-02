<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import DraftQuestionOverview from '$lib/components/form/DraftQuestionOverview.svelte';
	import type { FormSectionDraft } from '@prisma/client';
	import nProgress from 'nprogress';

	let { data }: PageProps = $props();
	let draftForm = $state(data.draftForm);
	let error = $state(data.error);

	let currentSection = $state(draftForm?.sections[0]);

	async function updateSection() {
		const formData = new FormData();
		formData.append('name', currentSection?.name || '');
		formData.append('description', currentSection?.description || '');
		formData.append('id', currentSection?.id || '');
		const response = await fetch('?/updateSection', {
			method: 'POST',
			body: formData
		});

		if (response.type === 'error') {
			error = 'Error updating section, please refresh the page.';
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
						use:enhance={() => {
							nProgress.start();
							return async ({ result, update }) => {
								if (result.type === 'success' && result.data) {
									draftForm.sections = [
										...draftForm.sections,
										{
											...(result.data.section as FormSectionDraft),
											questions: []
										}
									];
									currentSection = draftForm.sections[draftForm.sections.length - 1];
									update();
									nProgress.done();
								}
							};
						}}
					>
						<input
							type="text"
							name="name"
							placeholder="Untitled section"
							class="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						/>
						<button
							class="rounded bg-green-500 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-green-600"
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
								onclick={() => (currentSection = section)}
								class="w-full rounded {currentSection?.id === section.id
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
									if (currentSection?.id === section.id) {
										isCurrent = true;
									}
									return async ({ result, update }) => {
										if (result.type === 'success' && result.data) {
											draftForm.sections = draftForm.sections.filter((s) => s.id !== section.id);
											update();
											nProgress.done();
											if (isCurrent) {
												currentSection = draftForm.sections[0];
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
					{#if currentSection == undefined}
						<p class="my-2 text-center text-xl font-bold">
							Select or create a section to get started.
						</p>
					{:else}
						<input
							type="text"
							class="mb-1 w-full text-2xl font-bold"
							bind:value={currentSection.name}
							oninput={updateSection}
							placeholder="Enter section title"
						/>

						<textarea
							class="text-md w-full resize-none"
							bind:value={currentSection.description}
							oninput={updateSection}
							placeholder="Enter section description"
						>
						</textarea>

						{#if error}
							<p class="text-red-500">{error}</p>
						{/if}

						{#each currentSection.questions as question}
							<DraftQuestionOverview {question} />
						{/each}
					{/if}
				</div>
			</div>

			<!-- Right Sidebar (question editor) -->
			<div class="w-1/4 overflow-y-auto border-l bg-gray-50 p-4">
				<h2 class="text-lg font-semibold">Add/Edit Question</h2>

				<label class="mt-2 block">
					<span class="block text-sm font-medium">Question Type</span>
					<select class="mt-1 w-full rounded border p-2">
						<option>Text</option>
						<option>Paragraph</option>
						<option>Multiple Choice</option>
						<option>Dropdown</option>
						<option>Checkbox</option>
						<option>File Upload</option>
						<option>Date</option>
						<option>Number</option>
					</select>
				</label>

				<label class="mt-2 block">
					<span class="block text-sm font-medium">Prompt</span>
					<input
						type="text"
						class="mt-1 w-full rounded border p-2"
						placeholder="Enter question prompt..."
					/>
				</label>

				<!-- Placeholder for options if question type supports it -->
				<div class="mt-2">
					<span class="block text-sm font-medium">Options</span>
					<input type="text" class="mt-1 mb-1 w-full rounded border p-2" placeholder="Option 1" />
					<input type="text" class="mt-1 mb-1 w-full rounded border p-2" placeholder="Option 2" />
					<button class="mt-2 text-sm text-blue-600 hover:underline">+ Add another option</button>
				</div>

				<!-- Placeholder for other settings -->
				<label class="mt-2 block">
					<input type="checkbox" class="mr-2" />
					Required
				</label>

				<button class="mt-2 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
					Add Question
				</button>

				<hr />

				<button class="mt-2 w-full text-center text-blue-500 hover:underline">
					Open Question Library
				</button>
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
