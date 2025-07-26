<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';

	let showDateRange = $state(false);

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
			<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center justify-between">
					<h1 class="text-3xl font-bold">Published Form: {applicationForm?.name}</h1>
					<a href="/admin/published-forms" class="btn btn-danger px-3 py-1">Back</a>
				</div>

				<p><b>Description:</b> {applicationForm.description || 'No description provided'}</p>
				<p><b>ID:</b> {applicationForm.id}</p>
				<p>
					<b>Published At:</b>
					{applicationForm.publishedAt.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
				</p>
				<p><b>Active:</b> {applicationForm.active ? 'Yes' : 'No'}</p>
				<p>
					<b>Date Range:</b>
					{applicationForm.openDate?.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })} -
					{applicationForm.closeDate?.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
				</p>
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
					{:else}
						<form action="?/enablePublishedForm" method="post">
							<button
								type="submit"
								class="rounded-xl bg-green-600 px-4 py-1 text-white hover:bg-green-700"
							>
								Enable
							</button>
						</form>
					{/if}

					<button
						class="rounded-xl bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
						onclick={() => (showDateRange = true)}
					>
						Date Range
					</button>
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

			{#if showDateRange}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div class="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
						<h2 class="mb-2 text-center text-2xl font-bold">Edit Date Range</h2>
						<p class="text-center text-sm text-gray-500">
							If enabled, the form will be available between the selected dates.
						</p>
						<form class="flex flex-col gap-6" method="POST" action="?/updateFormDateRange">
							<input
								type="hidden"
								name="timezoneOffset"
								value={applicationForm.openDate?.getTimezoneOffset()}
							/>
							<div class="form-group flex flex-col gap-2">
								<label for="openDate" class="font-semibold">Open Date</label>
								<input
									type="datetime-local"
									id="openDate"
									name="openDate"
									class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
									value={applicationForm.openDate
										? new Date(
												applicationForm.openDate.getTime() -
													applicationForm.openDate.getTimezoneOffset() * 60000
											)
												.toISOString()
												.slice(0, 16)
										: ''}
								/>
							</div>
							<div class="form-group flex flex-col gap-2">
								<label for="closeDate" class="font-semibold">Close Date</label>
								<input
									type="datetime-local"
									id="closeDate"
									name="closeDate"
									class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
									value={applicationForm.closeDate
										? new Date(
												applicationForm.closeDate.getTime() -
													applicationForm.closeDate.getTimezoneOffset() * 60000
											)
												.toISOString()
												.slice(0, 16)
										: ''}
								/>
							</div>
							<div class="mt-2 flex justify-end gap-4">
								<button
									type="button"
									class="btn btn-danger rounded-xl px-3 py-1"
									onclick={() => (showDateRange = false)}
								>
									Cancel
								</button>
								<button type="submit" class="btn btn-primary rounded-xl px-3 py-1">Save</button>
							</div>
						</form>
					</div>
				</div>
			{/if}
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
