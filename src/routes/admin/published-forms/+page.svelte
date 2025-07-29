<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	let { data }: PageProps = $props();
	let { publishedForms = [], error } = data;

	// Add search state
	let search = $state('');

	// Add status filter state
	let statusFilter = $state<'all' | 'active' | 'inactive'>('all');

	// Filtered forms state
	let filteredForms = $state(publishedForms);

	// Sorting state
	let sortKey = $state<'id' | 'name' | 'description' | 'publishedAt' | 'active' | 'responses'>(
		'publishedAt'
	);
	let sortDirection = $state<'asc' | 'desc'>('desc');

	function setSort(key: typeof sortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	$effect(() => {
		let forms = publishedForms;
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
		// Status filter
		if (statusFilter === 'active') {
			forms = forms.filter((form) => form.active);
		} else if (statusFilter === 'inactive') {
			forms = forms.filter((form) => !form.active);
		}
		// Sorting
		forms = [...forms].sort((a, b) => {
			let aVal: any = a[sortKey];
			let bVal: any = b[sortKey];
			if (sortKey === 'publishedAt') {
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

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`View Published Application Forms`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Published Application Forms</h2>
			<p class="mb-4 text-sm text-gray-600">
				Published application forms, when active, can be accessed by students.
				<br />
				They cannot be edited, but can be deactivated and republished from a draft.
			</p>

			<!-- Search bar and status filter -->
			<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<input
					type="text"
					placeholder="Search by name, id, or description..."
					bind:value={search}
					class="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
				<select
					bind:value={statusFilter}
					class="rounded border border-gray-300 bg-blue-500 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				>
					<option value="all">All</option>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>
			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if !filteredForms || filteredForms.length === 0}
				<p class="text-center text-gray-500">No published application forms found</p>
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
									onclick={() => setSort('publishedAt')}
								>
									Created {sortKey === 'publishedAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('active')}
								>
									Active {sortKey === 'active' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('responses')}
								>
									Responses {sortKey === 'responses' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
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
										>{form.publishedAt.toLocaleDateString()} <br />
										{form.publishedAt.toLocaleTimeString()}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{form.active ? 'Yes' : 'No'}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{form.responses.length}
									</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<a
											href={`/admin/published-forms/${form.id}`}
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
