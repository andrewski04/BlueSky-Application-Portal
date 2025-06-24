<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from 'sv-tooltip';

	let { data }: { data: PageData } = $props();
	let { applicationForm, user } = data;
</script>

<svelte:head>
	<title>Application Form Details</title>
</svelte:head>

{#if applicationForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Form: ${applicationForm?.name} - ${applicationForm?.id}`} />
		<div class="container mx-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Form Details: {applicationForm?.name}</h1>
				<a href="/admin/forms" class="btn btn-danger px-3 py-1">Back</a>
			</div>

			<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<p><b>Description:</b> {applicationForm.description}</p>

				<p>
					<b>Active:</b>
					{applicationForm.active ? 'Yes' : 'No'}
				</p>
				<p>
					<b>Published:</b>
					{applicationForm.published ? 'Yes' : 'No'}
				</p>
				<p><b>Created At:</b> {applicationForm.createdAt.toLocaleString()}</p>
				<p><b>Last Updated:</b> {applicationForm.updatedAt.toLocaleString()}</p>

				<div class="mt-4 flex items-center gap-2">
					{#if !applicationForm.published}
						<a
							class="rounded-xl bg-green-600 px-4 py-1 text-white hover:bg-green-700"
							href="/admin/forms/{applicationForm.id}/edit"
						>
							Edit
						</a>
						<form action="?delete" method="post">
							<button
								type="submit"
								class="rounded-xl bg-red-600 px-4 py-1 text-white hover:bg-red-700"
							>
								Delete
							</button>
						</form>

						<form action="?publish" method="post">
							<Tooltip tip="Once published, a form cannot be edited." top>
								<button
									type="submit"
									class="rounded-xl bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
								>
									Publish
								</button>
							</Tooltip>
						</form>
					{/if}
					{#if applicationForm.published && applicationForm.active}
						<form action="?deactivate" method="post">
							<button
								type="submit"
								class="rounded-xl bg-red-600 px-4 py-1 text-white hover:bg-red-700"
							>
								Deactivate
							</button>
						</form>
					{/if}
				</div>
			</div>

			{#if applicationForm.sections.length == 0}
				<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
					<p class="text-center font-bold text-red-600">
						This form currently has no sections or questions.
					</p>
				</div>
			{/if}
			<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				{#each applicationForm.sections as section}
					<p class="mb-1 text-2xl font-bold">{section.name}</p>
					<p class="text-md">
						{section.description ? section.description : 'No description provided'}
					</p>
					{#each section.questions as question}
						<p class="mt-4 font-bold">{question.prompt}</p>
						<p class="text-sm">
							{question.type.charAt(0) + question.type.substring(1).toLowerCase()} Question
						</p>
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
