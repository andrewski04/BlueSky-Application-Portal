<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	let { data }: { data: PageData } = $props();
	let { error, applicationResponses } = data;

	// Add search state
	let search = $state('');

	// Add status filter state
	let statusFilter = $state<'all' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('all');

	// Filtered responses state
	let filteredResponses = $state(applicationResponses || []);

	// Sorting state
	let sortKey = $state<'id' | 'user' | 'updatedAt' | 'status'>('updatedAt');
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
		let responses = applicationResponses || [];
		if (search) {
			const q = search.toLowerCase();
			responses = responses.filter((response) => {
				return (
					response.user.firstName?.toLowerCase().includes(q) ||
					response.user.lastName?.toLowerCase().includes(q) ||
					response.id?.toLowerCase().includes(q) ||
					response.status?.toLowerCase().includes(q)
				);
			});
		}
		// Status filter
		if (statusFilter !== 'all') {
			responses = responses.filter((response) => response.status === statusFilter);
		}
		// Sorting
		responses = [...responses].sort((a, b) => {
			let aVal: any = a[sortKey];
			let bVal: any = b[sortKey];
			if (sortKey === 'user') {
				aVal = `${a.user.lastName}, ${a.user.firstName}`;
				bVal = `${b.user.lastName}, ${b.user.firstName}`;
			} else if (sortKey === 'updatedAt') {
				aVal = aVal ? aVal.getTime() : 0;
				bVal = bVal ? bVal.getTime() : 0;
			}
			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
		filteredResponses = responses;
	});
</script>

<svelte:head>
	<title>Application Submissions Overview</title>
</svelte:head>

<div class="main-container min-h-screen">
	<AdminNavBar message={`View Student Application Submissions`} />

	<div class="container mx-auto px-4 py-8">
		<div class="content-card mb-8">
			<div class="section-header p-6">
				<h2 class="flex items-center text-xl font-semibold text-gray-800">
					<svg
						class="mr-3 h-6 w-6 text-blue-600"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							opacity="0.1"
							d="M17.8284 6.82843C18.4065 7.40649 18.6955 7.69552 18.8478 8.06306C19 8.4306 19 8.83935 19 9.65685L19 17C19 18.8856 19 19.8284 18.4142 20.4142C17.8284 21 16.8856 21 15 21H9C7.11438 21 6.17157 21 5.58579 20.4142C5 19.8284 5 18.8856 5 17L5 7C5 5.11438 5 4.17157 5.58579 3.58579C6.17157 3 7.11438 3 9 3H12.3431C13.1606 3 13.5694 3 13.9369 3.15224C14.3045 3.30448 14.5935 3.59351 15.1716 4.17157L17.8284 6.82843Z"
							fill="currentColor"
						/>
						<path
							d="M17.8284 6.82843C18.4065 7.40649 18.6955 7.69552 18.8478 8.06306C19 8.4306 19 8.83935 19 9.65685L19 17C19 18.8856 19 19.8284 18.4142 20.4142C17.8284 21 16.8856 21 15 21H9C7.11438 21 6.17157 21 5.58579 20.4142C5 19.8284 5 18.8856 5 17L5 7C5 5.11438 5 4.17157 5.58579 3.58579C6.17157 3 7.11438 3 9 3H12.3431C13.1606 3 13.5694 3 13.9369 3.15224C14.3045 3.30448 14.5935 3.59351 15.1716 4.17157L17.8284 6.82843Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linejoin="round"
						/>
						<path
							d="M9 14L10.5772 15.5772V15.5772C10.8107 15.8107 11.1893 15.8107 11.4228 15.5772V15.5772L15 12"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Application Submissions
				</h2>
			</div>

			<!-- Search bar and status filter -->
			<div class="flex items-end justify-between px-6 pt-4">
				<input
					type="text"
					placeholder="Search by name, id, or status..."
					bind:value={search}
					class="search-input w-full max-w-xs px-3 py-2 text-sm focus:outline-none"
				/>
				<select
					bind:value={statusFilter}
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
				>
					<option value="all">All Statuses</option>
					<option value="DRAFT">Draft</option>
					<option value="SUBMITTED">Submitted</option>
					<option value="APPROVED">Approved</option>
					<option value="REJECTED">Rejected</option>
				</select>
			</div>
			{#if error}
				<p class="mb-4 text-center font-bold text-red-500">{error}</p>
			{/if}

			<hr class="my-4 h-px border-0 bg-[rgb(59,130,246)]/10" />

			<!--	Table	-->
			<div class="w-full rounded-b-lg shadow-md">
				<div class="space-y-4 rounded-b-lg">
					{#if !filteredResponses || filteredResponses.length === 0}
						<p class="pb-4 text-center text-gray-500">No application submissions found</p>
					{/if}
				</div>
				{#if filteredResponses && filteredResponses.length > 0}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('id')}
								>
									ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('user')}
								>
									User {sortKey === 'user' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('updatedAt')}
								>
									Last Updated {sortKey === 'updatedAt'
										? sortDirection === 'asc'
											? '▲'
											: '▼'
										: ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									onclick={() => setSort('status')}
								>
									Status {sortKey === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each filteredResponses as response}
								<tr class="hover:bg-gray-100">
									<td class="px-4 py-4 text-sm text-black">{response.id.slice(0, 6)}...</td>

									<td class="px-4 py-4 text-sm text-black"
										>{response.user.lastName}, {response.user.firstName}</td
									>
									<td class="px-6 py-4 text-sm text-gray-900"
										>{response.updatedAt.toLocaleString('en-US', {
											timeZoneName: 'shortGeneric'
										}) ??
											response.createdAt ??
											'N/A'}</td
									>
									<td class="px-4 py-4 text-sm text-black">
										{response.status}
									</td>
									<td class="px-4 py-4 text-sm text-black">
										<a
											href="/admin/submissions/{response.id}"
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
											View
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
