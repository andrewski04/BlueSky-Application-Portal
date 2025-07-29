<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

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
	<title>Application Forms Overview</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`View, Edit, and Create Application Forms`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Application Forms</h2>
			<p class="mb-4 text-sm text-gray-600">
				An application form draft is an editable template for an application.
				<br />
				When published, an uneditable copy of the form is created that students can fill out.
			</p>

			<div class="mb-6 flex gap-4">
				<button
					type="button"
					onclick={openFormCreationPopup}
					class="rounded bg-blue-500 px-2 py-1.5 text-sm font-bold text-white hover:bg-blue-700"
				>
					Create Custom Form
				</button>

				<form method="POST" action="?/createExampleForm">
					<button
						type="submit"
						class="rounded bg-blue-500 px-2 py-1.5 text-sm font-bold text-white hover:bg-blue-700"
					>
						Create Example Form
					</button>
				</form>
			</div>

			<!-- Search bar -->
			<div class="mb-4">
				<input
					type="text"
					placeholder="Search by name, id, or description..."
					bind:value={search}
					class="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>

			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}
			{#if form && form.error}
				<p class="mb-4 text-center text-red-500">{form.error}</p>
			{/if}

			{#if !filteredForms || filteredForms.length === 0}
				<p class="text-center text-gray-500">No application forms found</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('id')}
								>
									ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('name')}
								>
									Name {sortKey === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('description')}
								>
									Description {sortKey === 'description'
										? sortDirection === 'asc'
											? '▲'
											: '▼'
										: ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('createdAt')}
								>
									Created {sortKey === 'createdAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('updatedAt')}
								>
									Updated {sortKey === 'updatedAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each filteredForms as form}
								<tr class="hover:bg-gray-100">
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{form.id.slice(0, 6)}...</td
									>

									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{form.name}</td>
									<td class="px-6 py-4 text-sm text-gray-900">{form.description ?? 'N/A'}</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{form.createdAt.toLocaleDateString()} <br />
										{form.createdAt.toLocaleTimeString()}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{form.updatedAt.toLocaleDateString()} <br />
										{form.updatedAt.toLocaleTimeString()}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<a
											href={`/admin/form-drafts/${form.id}`}
											class="mr-2 inline-block rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
										>
											Manage
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Form Creation Popup -->
{#if showFormCreationPopup}
	<div class="fixed inset-0 z-100 flex items-center justify-center bg-black/70">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-xl font-semibold text-gray-800">Create Custom Form</h3>

			<form method="POST" action="?/createForm">
				<div class="mb-4">
					<label for="formName" class="mb-2 block text-sm font-medium text-gray-700">
						Form Name
						<span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="formName"
						name="formName"
						bind:value={formName}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="Enter form name"
					/>
				</div>

				<div class="mb-6">
					<label for="formDescription" class="mb-2 block text-sm font-medium text-gray-700">
						Description
					</label>
					<textarea
						id="formDescription"
						name="formDescription"
						bind:value={formDescription}
						rows="3"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="Enter form description (optional)"
					></textarea>
				</div>

				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={closeFormCreationPopup}
						class="rounded bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!formName.trim()}
						class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
					>
						Create Form
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
