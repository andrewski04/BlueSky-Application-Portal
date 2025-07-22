<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';

	let { data, form }: PageProps = $props();
	let { applicationForm, user } = data;
</script>

<svelte:head>
	<title>Published Form Details</title>
</svelte:head>

{#if applicationForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Published Form: ${applicationForm?.name}`} />
		<div class="container mx-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Published Form: {applicationForm?.name}</h1>
				<a href="/admin/published-forms" class="btn btn-danger px-3 py-1">Back</a>
			</div>

			<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<p><b>Description:</b> {applicationForm.description || 'No description provided'}</p>
				<p><b>ID:</b> {applicationForm.id}</p>
				<p><b>Published At:</b> {applicationForm.publishedAt.toLocaleString()}</p>
				<p><b>Active:</b> {applicationForm.active ? 'Yes' : 'No'}</p>
				<p>
					<b>Draft Responses:</b>
					{applicationForm.responses.filter((r) => r.status === 'DRAFT').length}
				</p>
				<p>
					<b>Submitted Responses:</b>
					{applicationForm.responses.filter((r) => r.status !== 'DRAFT').length}
				</p>
				<p>
					<b>Group:</b>
					{applicationForm.group?.name || 'No group'}
				</p>

				<div class="mt-4 flex items-center gap-2">
					{#if applicationForm.active}
						<form action="?/disablePublishedForm" method="post">
							<button
								type="submit"
								class="rounded-xl bg-red-600 px-4 py-1 text-white hover:bg-red-700"
							>
								Disable
							</button>
						</form>
					{/if}
					{#if !applicationForm.active}
						<form action="?/enablePublishedForm" method="post">
							<button
								type="submit"
								class="rounded-xl bg-green-600 px-4 py-1 text-white hover:bg-green-700"
							>
								Enable
							</button>
						</form>
					{/if}
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
						{#if question.questionVersion}
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
