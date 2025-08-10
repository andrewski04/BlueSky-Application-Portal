<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let { error, applicationResponses } = data;

	// Add search state
	let search = $state('');

	// Add status filter state
	let statusFilter = $state<'all' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('all');

	// Filtered responses state
	let filteredResponses = $state(applicationResponses || []);

	// Sorting state
	let sortKey = $state<'id' | 'user' | 'updatedAt' | 'status' | 'form' | 'group'>('updatedAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	const sortKeyMap = {
		id: 'ID',
		user: 'User',
		updatedAt: 'Last Opened',
		status: 'Status',
		form: 'Form Name',
		group: 'Group'
	};

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
			let aVal: any;
			let bVal: any;

			if (sortKey === 'user') {
				aVal = `${a.user.lastName}, ${a.user.firstName}`;
				bVal = `${b.user.lastName}, ${b.user.firstName}`;
			} else if (sortKey === 'updatedAt') {
				aVal = a.updatedAt ? a.updatedAt.getTime() : 0;
				bVal = b.updatedAt ? b.updatedAt.getTime() : 0;
			} else if (sortKey === 'group') {
				aVal = a.form?.group?.name ?? 'No group';
				bVal = b.form?.group?.name ?? 'No group';
			} else {
				aVal = a[sortKey as keyof typeof a];
				bVal = b[sortKey as keyof typeof b];
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

			<hr class="mt-4 h-px border-0 bg-[rgb(59,130,246)]/10" />

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
								{#each Object.keys(sortKeyMap) as key}
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort(key as typeof sortKey)}
									>
										{sortKeyMap[key as keyof typeof sortKeyMap]}
										{sortKey === key ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
								{/each}
								<th
									class="p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
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
										>{response.updatedAt?.toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										}) ?? 'N/A'}</td
									>
									<td class="px-4 py-4 text-sm text-black">
										{#if response.status === 'DRAFT'}
											<span class="rounded-lg bg-yellow-300 px-2 py-1 text-yellow-800">Draft</span>
										{:else if response.status === 'SUBMITTED'}
											<span class="rounded-lg bg-blue-300 px-2 py-1 text-blue-800">Submitted</span>
										{:else if response.status === 'APPROVED'}
											<span class="rounded-lg bg-green-300 px-2 py-1 text-green-800">Approved</span>
										{:else if response.status === 'REJECTED'}
											<span class="rounded-lg bg-red-300 px-2 py-1 text-red-800">Rejected</span>
										{/if}
									</td>
									<td class="px-4 py-4 text-sm text-black">
										<div class="space-y-2">
											<!-- Form Name -->
											<div class="font-medium text-gray-900">
												{response.form.name}
											</div>

											<!-- Status Badges Row -->
											<div class="flex flex-wrap gap-1">
												{#if response.form.closeDate && response.form.closeDate < new Date()}
													<span
														class="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-600/20 ring-inset"
													>
														<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
															<path
																fill-rule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
																clip-rule="evenodd"
															/>
														</svg>
														Past Due
													</span>
												{:else if response.form.active}
													<span
														class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset"
													>
														<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
															<path
																fill-rule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																clip-rule="evenodd"
															/>
														</svg>
														Active
													</span>
												{:else}
													<span
														class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/20 ring-inset"
													>
														<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
															<path
																fill-rule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																clip-rule="evenodd"
															/>
														</svg>
														Inactive
													</span>
												{/if}
												<!-- View Form Button -->
												<a
													href="/admin/published-forms/{response.form.id}"
													class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 transition-colors ring-inset hover:bg-blue-100"
												>
													<svg
														class="mr-1 h-3 w-3"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
														/>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
														/>
													</svg>
													View Form
												</a>
											</div>

											<!-- Due Date -->
											{#if response.form.closeDate}
												<div class="text-xs text-gray-500">
													<span class="font-medium">Due:</span>
													{response.form.closeDate.toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'short',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</div>
											{:else}
												<div class="text-xs text-gray-500">
													<span class="font-medium">No due date</span>
												</div>
											{/if}
										</div>
									</td>
									<td class="px-4 py-4 text-sm text-black">
										{response.form.group?.name ?? 'No group'}
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
