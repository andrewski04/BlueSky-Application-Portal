<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';

	let { data }: { data: PageData } = $props();
	let { applicationForm, user } = data;
</script>

<svelte:head>
	<title>Form Draft Details</title>
</svelte:head>

{#if applicationForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Draft: ${applicationForm?.name}`} />
		<div class="container mx-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Form Draft: {applicationForm?.name}</h1>
				<a href="/admin/form-drafts" class="btn btn-danger px-3 py-1">Back</a>
			</div>

			<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<p><b>Description:</b> {applicationForm.description}</p>
				<p><b>Created At:</b> {applicationForm.createdAt.toLocaleString()}</p>
				<p><b>Last Updated:</b> {applicationForm.updatedAt.toLocaleString()}</p>

				<div class="mt-4 flex items-center gap-2">
					<a
						class="rounded-xl bg-green-600 px-4 py-1 text-white hover:bg-green-700"
						href="/admin/forms/{applicationForm.id}/edit"
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
								class="rounded-xl bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
							>
								Publish
							</button>
						</Tooltip>
					</form>
				</div>
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
