<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';

	let editFormPopup = $state(false);

	let { data, form }: PageProps = $props();
	let { applicationForm, user } = data;
</script>

<svelte:head>
	<title>Form Draft Details</title>
</svelte:head>

{#if applicationForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Draft: ${applicationForm?.name}`} />
		<div class="container mx-auto p-6">
			<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<h1 class="text-3xl font-bold">Form Draft: {applicationForm?.name}</h1>
						<button
							class="inline-block align-middle"
							aria-label="Edit form draft"
							onclick={() => {
								editFormPopup = true;
							}}
						>
							<img src="/icons/edit.svg" alt="Edit" class="h-6 w-6" />
						</button>
					</div>
					<a href="/admin/form-drafts" class="btn btn-danger px-3 py-1">Back</a>
				</div>
				<p><b>Description:</b> {applicationForm.description || 'No description provided'}</p>
				<p><b>ID:</b> {applicationForm.id}</p>
				<p>
					<b>Created At:</b>
					{applicationForm.createdAt.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
				</p>
				<p>
					<b>Last Updated:</b>
					{applicationForm.updatedAt.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
				</p>

				<div class="mt-4 flex items-center gap-2">
					<a
						class="rounded-xl bg-green-600 px-4 py-1 text-white hover:bg-green-700"
						href="/admin/form-drafts/{applicationForm.id}/edit"
					>
						Edit
					</a>
					<form action="?/deleteDraft" method="post">
						<button
							type="submit"
							class="rounded-xl bg-red-600 px-4 py-1 text-white hover:bg-red-700"
						>
							Delete
						</button>
					</form>

					<form action="?/publishDraft" method="post">
						<Tooltip
							tip="Creates uneditable copy of the form, <br> the draft will remain after publishing."
							top
						>
							<button
								type="submit"
								disabled={applicationForm?.sections.length === 0}
								class="rounded-xl bg-blue-600 px-4 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
							>
								Publish
							</button>
						</Tooltip>
					</form>
				</div>
				{#if form?.error}
					<p class="text-center font-bold text-red-700">Error: {form.error}</p>
				{/if}
			</div>

			<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				{#if applicationForm.sections.length == 0}
					<p class="text-center font-bold text-red-600">
						This form currently has no sections or questions.
					</p>
				{/if}

				{#each applicationForm.sections as section}
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
					<hr class="my-6 text-gray-400" />
				{/each}
			</div>
		</div>
	</div>

	{#if editFormPopup}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
				<h2 class="mb-2 text-center text-2xl font-bold">Edit Form Draft</h2>
				<form class="flex flex-col gap-6" method="POST" action="?/updateDraft">
					<div class="form-group flex flex-col gap-2">
						<label for="name" class="font-semibold">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
							value={applicationForm.name}
						/>
					</div>
					<div class="description flex flex-col gap-2">
						<label for="description" class="font-semibold">Description</label>
						<textarea
							id="description"
							name="description"
							class="form-control min-h-[100px] resize-y rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
							value={applicationForm.description}
						></textarea>
					</div>
					<div class="mt-2 flex justify-end gap-4">
						<button
							type="button"
							class="btn btn-danger rounded-xl px-3 py-1"
							onclick={() => (editFormPopup = false)}
						>
							Cancel
						</button>
						<button type="submit" class="btn btn-primary rounded-xl px-3 py-1">Save</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
{:else}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Form: Form Not Found`} />
		<div class="container mx-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Form Details</h1>
				<a href="/admin/forms" class="btn btn-danger px-3 py-1">Back</a>
			</div>
			<div
				class="mb-6 rounded-md border border-gray-200 bg-white p-6 text-center text-red-500 shadow-sm"
			>
				<p><b>Error retrieving form details</b></p>
			</div>
		</div>
	</div>
{/if}
