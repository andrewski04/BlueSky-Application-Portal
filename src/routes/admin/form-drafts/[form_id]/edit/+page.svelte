<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';

	let { data }: PageProps = $props();
	let { applicationForm } = data;
</script>

{#if applicationForm}
	<div class="bg-secondary flex h-screen flex-col">
		<AdminNavBar message={`Editing Draft: ${applicationForm.name}`} />

		<div class="flex min-h-0 flex-1 overflow-hidden">
			<!-- Left Sidebar (section navigation)-->
			<div class="w-1/6 overflow-y-auto border-r bg-gray-100 p-4">
				<h2 class="text-center text-lg font-bold">Sections</h2>
				<div class="space-y-2">
					{#each applicationForm.sections as section}
						<button class="w-full rounded px-3 py-2 text-left hover:bg-blue-100">
							{section.name}
						</button>
					{/each}
				</div>
				<div class="mt-4 flex flex-col gap-2">
					<button class="rounded bg-green-500 px-3 py-2 text-white hover:bg-green-600">
						Add Section
					</button>
				</div>
			</div>

			<!-- Main content (center preview) -->
			<div class="flex-1 overflow-y-auto p-6">
				{#if applicationForm.sections.length == 0}
					<p class="mt-5 text-center font-bold text-red-600">
						This form currently has no sections or questions.
					</p>
				{/if}

				{#each applicationForm.sections as section}
					<div class="mb-4 rounded-md bg-white p-4">
						<p class="mb-1 text-2xl font-bold">{section.name}</p>
						<p class="text-md">
							{section.description ? section.description : 'No description provided'}
						</p>
						{#each section.questions as question}
							{#if question.questionDraft}
								<p class="mt-4 font-bold">
									{question.questionDraft.prompt}
									<Tooltip tip="Required" top>
										<span class="text-red-600">{question.required ? '*' : ''}</span>
									</Tooltip>
								</p>

								<p class="text-sm">
									{QuestionTypeMap[question.questionDraft.type]}
								</p>

								{#if question.questionDraft.options.length > 0}
									<p class="mt-2 text-sm font-bold underline">Options</p>
									{#each question.questionDraft.options as option}
										<p class="text-sm">{option.text}</p>
									{/each}
								{/if}
							{:else if question.questionVersion}
								<p class="mt-4 font-bold">
									{question.questionVersion.prompt}
									<Tooltip tip="Required" top>
										<span class="text-red-600">{question.required ? '*' : ''}</span>
									</Tooltip>
								</p>
								<Tooltip
									tip="Library questions cannot be edited directly within a form. See Question Library page for more information."
									right
								>
									<p class="text-sm text-gray-700">Library Question ⓘ</p>
								</Tooltip>
								<p class="text-sm">
									{QuestionTypeMap[question.questionVersion.type]}
								</p>

								{#if question.questionVersion.options.length > 0}
									<p class="mt-2 text-sm font-bold underline">Options</p>
									{#each question.questionVersion.options as option}
										<p class="text-sm">{option.text}</p>
									{/each}
								{/if}
							{/if}
						{/each}
					</div>
				{/each}
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

{#if !applicationForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message="Form draft not found" />

		<p class="mt-12 text-center text-2xl font-bold text-red-700">Error retrieving form draft</p>
	</div>
{/if}
