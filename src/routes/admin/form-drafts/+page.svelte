<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';

	let { data, form }: PageProps = $props();

	let showFormCreationPopup = $state(false);
	let formName = $state('');
	let formDescription = $state('');

	// Add search state
	let search = $state('');

	// Filtered forms state
	let filteredForms = $state(data.applicationForms);

	// Sorting state
	let sortKey = $state<'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'>('updatedAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	function setSort(key: typeof sortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	function openFormCreationPopup() {
		showFormCreationPopup = true;
		formName = '';
		formDescription = '';
	}

	function closeFormCreationPopup() {
		showFormCreationPopup = false;
		formName = '';
		formDescription = '';
	}

	let { user, applicationForms, error } = data;

	$effect(() => {
		let forms = applicationForms;
		if (search) {
			const q = search.toLowerCase();
			forms = forms.filter((form) => {
				return (
					form.name?.toLowerCase().includes(q) ||
					form.id?.toLowerCase().includes(q) ||
					form.description?.toLowerCase().includes(q)
				);
			});
		}
		// Sorting
		forms = [...forms].sort((a, b) => {
			let aVal: any = a[sortKey];
			let bVal: any = b[sortKey];
			if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
				aVal = aVal ? aVal.getTime() : 0;
				bVal = bVal ? bVal.getTime() : 0;
			}
			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
		filteredForms = forms;
	});
</script>

<svelte:head>
	<title>Form Drafts Overview</title>
</svelte:head>

<div class="main-container min-h-screen">
	<AdminNavBar message={`View, Edit, and Create Application Forms`} />

	<div class="container mx-auto px-4 py-8">
		<div class="content-card mb-8">
			<div class="section-header p-6">
				<h2 class="flex items-center text-xl font-semibold text-gray-800">
					<svg
						class="mr-3 h-6 w-6 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						></path>
					</svg>
					Application Form Drafts
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					An application form draft is an editable template for an application.
					<br />
					When published, an uneditable copy of the form is created that students can fill out.
				</p>
			</div>

			<div>
				<div class="flex items-end justify-between px-6 pt-4">
					<div class="flex gap-4">
						<button
							type="button"
							onclick={openFormCreationPopup}
							class="btn-green relative overflow-hidden px-4 py-2"
						>
							Create Custom Form
						</button>

						<form method="POST" action="?/createExampleForm">
							<button type="submit" class="btn-blue px-4 py-2"> Create Example Form </button>
						</form>
					</div>
					<!-- Search bar -->

					<input
						type="text"
						placeholder="Search by name, id, or description..."
						bind:value={search}
						class="search-input w-full max-w-xs px-3 py-2 text-sm focus:outline-none"
					/>
				</div>

				{#if error}
					<p class="mb-4 text-center font-bold text-red-500">{error}</p>
				{/if}
				{#if form && form.error}
					<p class="mb-4 text-center font-bold text-red-500">{form.error}</p>
				{/if}
			</div>

			<hr class="mt-4 h-px border-0 bg-[rgb(59,130,246)]/10" />

			<div class="w-full rounded-b-lg shadow-md">
				<div class="space-y-4 rounded-b-lg">
					{#if !filteredForms || filteredForms.length === 0}
						<p class="pb-4 text-center text-gray-500">No application forms found</p>
					{/if}
				</div>
				{#if filteredForms && filteredForms.length > 0}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="cursor-pointer p-4 pt-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('id')}
								>
									ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('name')}
								>
									Name {sortKey === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('description')}
								>
									Description {sortKey === 'description'
										? sortDirection === 'asc'
											? '▲'
											: '▼'
										: ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('createdAt')}
								>
									Created {sortKey === 'createdAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('updatedAt')}
								>
									Updated {sortKey === 'updatedAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="p-4 pt-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each filteredForms as form}
								<tr class="hover:bg-gray-100">
									<td class="px-4 py-4 text-sm whitespace-nowrap text-black"
										>{form.id.slice(0, 6)}...</td
									>
									<td class="px-4 py-4 text-sm text-black">{form.name}</td>
									<td class="px-4 py-4 text-sm text-black">{form.description ?? 'N/A'}</td>
									<td class="px-4 py-4 text-sm text-black"
										>{form.createdAt.toLocaleDateString()} <br />
										{form.createdAt.toLocaleTimeString()}</td
									>
									<td class="px-4 py-4 text-sm text-black"
										>{form.updatedAt.toLocaleDateString()} <br />
										{form.updatedAt.toLocaleTimeString()}</td
									>
									<td class="px-4 py-2 text-sm whitespace-nowrap">
										<a
											href={`/admin/form-drafts/${form.id}`}
											class="btn-green flex items-center justify-center px-4 py-2"
										>
											<svg
												class="mr-1 inline h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
												></path>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												></path>
											</svg>
											Manage
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Form Creation Popup -->
{#if showFormCreationPopup}
	<div class="fixed inset-0 z-100 flex items-center justify-center bg-black/70">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-xl font-bold text-gray-800">Create Custom Form</h3>

			<form method="POST" action="?/createForm">
				<div class="mb-4">
					<label for="formName" class="mb-2 block font-medium text-gray-700">
						Form Name
						<span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="formName"
						name="formName"
						bind:value={formName}
						maxlength={100}
						minlength={3}
						required
						class="search-input w-full rounded-md px-3 py-2 focus:outline-none"
						placeholder="Enter form name"
					/>
				</div>

				<div class="mb-4">
					<label for="formDescription" class="mb-2 block font-medium text-gray-700">
						Description
					</label>
					<textarea
						id="formDescription"
						name="formDescription"
						bind:value={formDescription}
						maxlength={500}
						rows="3"
						class="search-input w-full rounded-md px-3 py-2 focus:outline-none"
						placeholder="Enter form description (optional)"
					></textarea>
				</div>

				<div class="flex justify-end gap-3">
					<button type="button" onclick={closeFormCreationPopup} class="btn-red px-4 py-2">
						Cancel
					</button>
					<button
						type="submit"
						disabled={!formName.trim()}
						class="btn-blue px-4 py-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-50"
					>
						Create Form
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
