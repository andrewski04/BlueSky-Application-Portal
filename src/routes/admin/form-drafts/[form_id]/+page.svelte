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
	<style>
		.main-container {
			background: linear-gradient(
				180deg,
				rgba(239, 246, 255, 0.5) 0%,
				rgba(219, 234, 254, 0.3) 50%,
				rgba(147, 197, 253, 0.1) 100%
			);
		}
		.content-card {
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
			transition: all 0.3s ease;
		}

		.content-card:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.15),
				0 6px 20px rgba(0, 0, 0, 0.08);
			transform: translateY(-2px);
		}

		.section-header {
			background: linear-gradient(
				135deg,
				rgba(59, 130, 246, 0.05) 0%,
				rgba(147, 197, 253, 0.05) 100%
			);
			border-bottom: 1px solid rgba(59, 130, 246, 0.1);
			border-radius: 16px 16px 0 0;
		}
	</style>
</svelte:head>

{#if applicationForm}
	<div class="main-container min-h-screen">
		<AdminNavBar message={`Viewing Draft: ${applicationForm?.name}`} />
		<div class="content-card container mx-auto mt-8 p-6">
			<div class="section-header rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<!-- Header with title and back button -->
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<h1 class="text-3xl font-bold text-gray-800">Form Draft: {applicationForm?.name}</h1>
						<button
							class="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
							aria-label="Edit form draft"
							onclick={() => {
								editFormPopup = true;
							}}
						>
							<img src="/icons/edit.svg" alt="Edit" class="h-5 w-5" />
						</button>
					</div>
					<button onclick={() => history.back()} class="btn-red px-4 py-2">Back</button>
				</div>

				<!-- Description -->
				<div class="mb-6">
					<p class="text-lg leading-relaxed text-gray-700">
						{applicationForm.description || 'No description provided'}
					</p>
				</div>

				<!-- Metadata Grid -->
				<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Form ID
						</h3>
						<p class="font-mono text-sm text-gray-800">{applicationForm.id}</p>
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Created
						</h3>
						<p class="text-sm text-gray-800">
							{applicationForm.createdAt.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
						</p>
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Last Updated
						</h3>
						<p class="text-sm text-gray-800">
							{applicationForm.updatedAt.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
						</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex items-center gap-3">
					<a
						class="btn-green px-6 py-2 text-lg"
						href="/admin/form-drafts/{applicationForm.id}/edit"
					>
						Edit Form
					</a>
					<form action="?/deleteDraft" method="post" class="inline">
						<button type="submit" class="btn-red px-6 py-2 text-lg">Delete Draft</button>
					</form>
					<form action="?/publishDraft" method="post" class="inline">
						<button
							type="submit"
							disabled={applicationForm?.sections.length === 0}
							class="btn-blue px-6 py-2 text-lg disabled:cursor-not-allowed disabled:opacity-50"
						>
							Publish Form
						</button>
					</form>
				</div>

				{#if form?.error}
					<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
						<p class="font-medium text-red-700">Error: {form.error}</p>
					</div>
				{/if}
			</div>

			<div class="rounded-b-lg border border-gray-200 bg-white p-6 shadow-sm">
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
							class="btn-bluebtn-red rounded-xl px-3 py-1"
							onclick={() => (editFormPopup = false)}
						>
							Cancel
						</button>
						<button type="submit" class="btn-blue rounded-xl px-3 py-1">Save</button>
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
				<button onclick={() => history.back()} class="btn-red px-3 py-1">Back</button>
			</div>
			<div
				class="mb-6 rounded-md border border-gray-200 bg-white p-6 text-center text-red-500 shadow-sm"
			>
				<p><b>Error retrieving form details</b></p>
			</div>
		</div>
	</div>
{/if}
