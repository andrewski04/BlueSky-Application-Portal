<script lang="ts">
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import SearchableDropdown from '$lib/components/util/SearchableDropdown.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import nProgress from 'nprogress';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	// Local state for form inputs
	let search = $state('');
	let statusFilter = $state<
		'all' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
	>('SUBMITTED');
	let groupFilter = $state<string>('all');
	let formFilter = $state<string>('all');
	let dateFromFilter = $state<string>('');
	let dateToFilter = $state<string>('');
	let sortKey = $state<
		'id' | 'user' | 'updatedAt' | 'submittedAt' | 'status' | 'form' | 'group' | 'rating'
	>('updatedAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');
	let showAdminSubmissions = $state(false);

	// Data state
	let applicationResponses = $state<any[]>([]);
	let pagination = $state<any>(null);
	let error = $state<string | null>(null);
	let loading = $state(false);
	let availableGroups = $state<any[]>([]);
	let availableForms = $state<Array<{ id: string; name: string; adminName?: string }>>([]);
	let isExporting = $state(false);

	const sortKeyMap = {
		id: 'ID',
		user: 'User',
		updatedAt: 'Last Opened',
		submittedAt: 'Submitted Date',
		status: 'Status',
		form: 'Form Name',
		group: 'Group',
		rating: 'Rating'
	};

	// Function to fetch data from the API
	async function fetchData() {
		error = null;

		try {
			const params = new URLSearchParams();
			if (search) params.set('search', search);
			if (statusFilter !== 'all') params.set('status', statusFilter);
			if (groupFilter !== 'all') params.set('group', groupFilter);
			if (formFilter !== 'all') params.set('form', formFilter);
			if (dateFromFilter) params.set('dateFrom', dateFromFilter);
			if (dateToFilter) params.set('dateTo', dateToFilter);
			if (sortKey !== 'updatedAt') params.set('sort', sortKey);
			if (sortDirection !== 'desc') params.set('direction', sortDirection);
			if (showAdminSubmissions) params.set('showAdminSubmissions', 'true');

			// Get current page from URL or pagination state
			const urlParams = new URLSearchParams(window.location.search);
			const currentPage = urlParams.get('page')
				? parseInt(urlParams.get('page')!)
				: pagination?.currentPage || 1;
			if (currentPage > 1) params.set('page', currentPage.toString());

			const url = `/admin/submissions?${params.toString()}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}

			const data = await response.json();

			// Parse dates in the response data
			if (data.applicationResponses) {
				applicationResponses = data.applicationResponses.map((response: any) => ({
					...response,
					updatedAt: response.updatedAt ? new Date(response.updatedAt) : null,
					submittedAt: response.submittedAt ? new Date(response.submittedAt) : null,
					form: {
						...response.form,
						closeDate: response.form.closeDate ? new Date(response.form.closeDate) : null
					}
				}));
			} else {
				applicationResponses = [];
			}

			// Update available filter options
			if (data.availableGroups) availableGroups = data.availableGroups;
			if (data.availableForms) availableForms = data.availableForms;

			pagination = data.pagination;
			error = data.error || null;
		} catch (err) {
			error = 'An error occurred while loading the application responses.';
			console.error('Error fetching data:', err);
		} finally {
			loading = false;
		}
	}

	// Initialize component on mount
	onMount(() => {
		loading = true;

		// Initialize state from URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		search = urlParams.get('search') || '';
		statusFilter =
			(urlParams.get('status') as
				| 'all'
				| 'DRAFT'
				| 'SUBMITTED'
				| 'UNDER_REVIEW'
				| 'APPROVED'
				| 'REJECTED') || 'all';
		groupFilter = urlParams.get('group') || 'all';
		formFilter = urlParams.get('form') || 'all';
		dateFromFilter = urlParams.get('dateFrom') || '';
		dateToFilter = urlParams.get('dateTo') || '';
		sortKey =
			(urlParams.get('sort') as
				| 'id'
				| 'user'
				| 'updatedAt'
				| 'submittedAt'
				| 'status'
				| 'form'
				| 'group') || 'updatedAt';
		sortDirection = (urlParams.get('direction') as 'asc' | 'desc') || 'desc';
		showAdminSubmissions = urlParams.get('showAdminSubmissions') === 'true';

		// Initialize pagination state from URL
		const pageParam = urlParams.get('page');
		if (pageParam) {
			const pageNum = parseInt(pageParam);
			if (!isNaN(pageNum) && pageNum > 0) {
				pagination = {
					currentPage: pageNum,
					totalPages: 0,
					totalCount: 0,
					limit: 20
				};
			}
		}

		// Fetch initial data
		fetchData();
	});

	function setSort(key: typeof sortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
		updateURL();
	}

	async function updateURL() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		if (groupFilter !== 'all') params.set('group', groupFilter);
		if (formFilter !== 'all') params.set('form', formFilter);
		if (dateFromFilter) params.set('dateFrom', dateFromFilter);
		if (dateToFilter) params.set('dateTo', dateToFilter);
		if (sortKey !== 'updatedAt') params.set('sort', sortKey);
		if (sortDirection !== 'desc') params.set('direction', sortDirection);
		if (showAdminSubmissions) params.set('showAdminSubmissions', 'true');

		// Get current page from pagination state or default to 1
		const currentPage = pagination?.currentPage || 1;
		if (currentPage > 1) params.set('page', currentPage.toString());

		const url = params.toString() ? `?${params.toString()}` : '';
		await goto(`/admin/submissions${url}`, { replaceState: true });
		// Fetch new data after URL update
		await fetchData();
	}

	async function goToPage(pageNum: number) {
		if (!pagination) return;

		if (pageNum >= 1 && pageNum <= pagination.totalPages) {
			// Update pagination state immediately for better UX
			pagination.currentPage = pageNum;

			const params = new URLSearchParams();
			if (search) params.set('search', search);
			if (statusFilter !== 'all') params.set('status', statusFilter);
			if (sortKey !== 'updatedAt') params.set('sort', sortKey);
			if (sortDirection !== 'desc') params.set('direction', sortDirection);
			if (pageNum > 1) params.set('page', pageNum.toString());

			const url = params.toString() ? `?${params.toString()}` : '';
			await goto(`/admin/submissions${url}`);
			// Fetch new data after navigation
			await fetchData();
		}
	}

	async function handleSearch() {
		// Reset to first page when searching
		if (pagination) {
			pagination.currentPage = 1;
		} else {
			// Initialize pagination if it doesn't exist
			pagination = {
				currentPage: 1,
				totalPages: 0,
				totalCount: 0,
				limit: 20
			};
		}

		// Update URL without losing focus
		await updateURL();
	}

	async function handleFilter() {
		// Reset to first page when filtering
		if (pagination) {
			pagination.currentPage = 1;
		} else {
			// Initialize pagination if it doesn't exist
			pagination = {
				currentPage: 1,
				totalPages: 0,
				totalCount: 0,
				limit: 20
			};
		}

		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		if (groupFilter !== 'all') params.set('group', groupFilter);
		if (formFilter !== 'all') params.set('form', formFilter);
		if (dateFromFilter) params.set('dateFrom', dateFromFilter);
		if (dateToFilter) params.set('dateTo', dateToFilter);
		if (sortKey !== 'updatedAt') params.set('sort', sortKey);
		if (sortDirection !== 'desc') params.set('direction', sortDirection);
		if (showAdminSubmissions) params.set('showAdminSubmissions', 'true');

		const url = params.toString() ? `?${params.toString()}` : '';
		await goto(`/admin/submissions${url}`);
		// Fetch new data after filtering
		await fetchData();
	}

	async function clearFilters() {
		search = '';
		statusFilter = 'all';
		groupFilter = 'all';
		formFilter = 'all';
		dateFromFilter = '';
		dateToFilter = '';
		showAdminSubmissions = false;
		await handleFilter();
	}

	async function exportSubmissions() {
		try {
			nProgress.start();
			isExporting = true;

			// Build the same parameters used for filtering
			const params = new URLSearchParams();
			if (search) params.set('search', search);
			if (statusFilter !== 'all') params.set('status', statusFilter);
			if (groupFilter !== 'all') params.set('group', groupFilter);
			if (formFilter !== 'all') params.set('form', formFilter);
			if (dateFromFilter) params.set('dateFrom', dateFromFilter);
			if (dateToFilter) params.set('dateTo', dateToFilter);
			if (showAdminSubmissions) params.set('showAdminSubmissions', 'true');

			// Create the export URL
			const exportUrl = `/admin/submissions/export?${params.toString()}`;

			// Create a temporary link and trigger download
			const link = document.createElement('a');
			link.href = exportUrl;
			link.download = `submissions-export-${new Date().toISOString().split('T')[0]}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('Error exporting submissions:', error);
			alert('An error occurred while exporting submissions.');
		} finally {
			isExporting = false;
			nProgress.done();
		}
	}

	// Debounced search function
	let searchTimeout: NodeJS.Timeout;
	function debouncedSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(async () => {
			// Use fetchData directly instead of handleSearch to avoid navigation
			await fetchData();
		}, 500);
	}

	function getPageNumbers() {
		if (!pagination) return [];

		const totalPages = pagination.totalPages;
		const currentPage = pagination.currentPage;
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
		const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

		if (endPage - startPage + 1 < maxPagesToShow) {
			startPage = Math.max(1, endPage - maxPagesToShow + 1);
		}

		return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
	}
</script>

<svelte:head>
	<title>Application Submissions Overview</title>
</svelte:head>

<div class="main-container min-h-screen">
	<AdminNavBar message={`View Student Application Submissions`} />

	<div class="mx-auto px-4 py-8 lg:max-w-[80%]">
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

			<!-- Search bar and filters -->
			<div class=" px-6 pt-4">
				<!-- Search row -->
				<div class="mb-4 flex items-center space-x-2">
					<input
						type="text"
						placeholder="Search by name, email, or id..."
						bind:value={search}
						oninput={debouncedSearch}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						class="search-input w-full max-w-xs px-3 py-2 text-sm focus:outline-none"
					/>
					<button onclick={handleSearch} class="btn-blue px-4 py-2 text-sm">
						<span class="w-full text-center">Search</span>
					</button>
				</div>

				<!-- Filter row -->
				<div class="flex flex-wrap items-center gap-4">
					<!-- Status Filter -->
					<select
						bind:value={statusFilter}
						onchange={async () => await handleFilter()}
						class=" cursor-pointer rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
					>
						<option value="all">All Statuses</option>
						<option value="DRAFT">Draft</option>
						<option value="SUBMITTED">Submitted</option>
						<option value="UNDER_REVIEW">Under Review</option>
						<option value="APPROVED">Approved</option>
						<option value="REJECTED">Rejected</option>
					</select>

					<!-- Group Filter -->
					<SearchableDropdown
						options={[{ id: 'all', name: 'All Groups' }, ...availableGroups]}
						value={groupFilter}
						placeholder="All Groups"
						class="w-[200px]"
						onChange={async (newValue) => {
							groupFilter = newValue;
							await handleFilter();
						}}
					/>

					<!-- Form Filter -->
					<SearchableDropdown
						options={[{ id: 'all', name: 'All Forms' }, ...availableForms]}
						value={formFilter}
						placeholder="All Forms"
						class="w-[200px]"
						onChange={async (newValue) => {
							formFilter = newValue;
							await handleFilter();
						}}
					/>

					<!-- Date Range Filters -->
					<div class="flex items-center space-x-2">
						<input
							type="date"
							bind:value={dateFromFilter}
							onchange={async () => await handleFilter()}
							placeholder="From Date"
							class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
						/>
						<span class="text-sm text-gray-500">to</span>
						<input
							type="date"
							bind:value={dateToFilter}
							onchange={async () => await handleFilter()}
							placeholder="To Date"
							class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<!-- Clear Filters Button -->
					<button onclick={clearFilters} class="btn-red px-3 py-2 text-sm"> Clear Filters </button>

					<!-- Export Button -->
					<Tooltip tip="Export all submissions with current filters as a PDF" top>
						<button
							onclick={() => {
								exportSubmissions();
							}}
							disabled={isExporting}
							class="btn-blue px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isExporting}
								<svg class="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Generating PDF...
							{:else}
								<svg
									class="mr-2 inline h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								Export PDF
							{/if}
						</button>
					</Tooltip>
				</div>
			</div>

			<div class="flex space-x-8 px-6 py-2">
				<!-- Results count and pagination info -->
				{#if pagination}
					<div class="text-sm text-gray-600">
						Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(
							pagination.currentPage * pagination.limit,
							pagination.totalCount
						)} of {pagination.totalCount} submissions
					</div>
				{/if}
				<div class="ml-2 flex items-center space-x-2">
					<input
						type="checkbox"
						bind:checked={showAdminSubmissions}
						id="showAdminSubmissions"
						onchange={async () => {
							await handleFilter();
						}}
						class="h-4 w-4 cursor-pointer"
					/>
					<label for="showAdminSubmissions" class="w-full cursor-pointer text-center text-sm">
						Include admin submissions
					</label>
				</div>
			</div>

			<!-- Top Pagination Controls -->
			{#if pagination && pagination.totalPages > 1}
				<div class="flex items-center justify-between border-t border-gray-200 px-6 pt-2">
					<!-- First button on the left -->
					<button
						onclick={async () => await goToPage(1)}
						disabled={pagination.currentPage === 1}
						class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						First
					</button>

					<!-- Center section with Previous, Page Numbers, and Next -->
					<div class="flex items-center space-x-2">
						<button
							onclick={async () => await goToPage(pagination.currentPage - 1)}
							disabled={pagination.currentPage === 1}
							class="btn-red rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
						>
							Previous
						</button>

						<div class="flex items-center space-x-1">
							{#each getPageNumbers() as pageNum}
								<button
									onclick={async () => await goToPage(pageNum)}
									class="rounded-md px-3 py-2 text-sm font-medium {pageNum ===
									pagination.currentPage
										? 'bg-blue-600 text-white'
										: 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}"
								>
									{pageNum}
								</button>
							{/each}
						</div>

						<button
							onclick={async () => await goToPage(pagination.currentPage + 1)}
							disabled={pagination.currentPage === pagination.totalPages}
							class="btn-blue rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next
						</button>
					</div>

					<!-- Last button on the right -->
					<button
						onclick={async () => await goToPage(pagination.totalPages)}
						disabled={pagination.currentPage === pagination.totalPages}
						class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Last
					</button>
				</div>
			{/if}

			{#if error}
				<p class="mb-4 text-center font-bold text-red-500">{error}</p>
			{/if}

			<hr class="mt-2 h-px border-0 bg-[rgb(59,130,246)]/10" />

			<!--	Table	-->
			<div class="w-full rounded-b-lg shadow-md">
				{#if loading}
					<div class="flex items-center justify-center py-8">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
						<span class="ml-2 text-gray-600">Loading...</span>
					</div>
				{:else if !applicationResponses || applicationResponses.length === 0}
					<div class="space-y-4 rounded-b-lg">
						<p class="py-4 text-center text-gray-500">
							No application submissions found. Check the search and filter options.
						</p>
					</div>
				{:else}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								{#each Object.keys(sortKeyMap) as key}
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={async () => await setSort(key as typeof sortKey)}
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
							{#each applicationResponses as response}
								<tr class="hover:bg-gray-100">
									<td class="px-4 py-4 text-sm text-black">{response.id.slice(0, 6)}...</td>

									<td class="px-4 py-4 text-sm text-black">
										<div>
											<div>{response.user.lastName}, {response.user.firstName}</div>
											<div class="text-xs text-gray-500">{response.user.email}</div>
										</div>
									</td>
									<td class="px-6 py-4 text-sm text-gray-900">
										{#if response.updatedAt}
											<div>
												<div>
													{response.updatedAt.toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'short',
														day: 'numeric'
													})}
												</div>
												<div class="text-xs text-gray-500">
													{response.updatedAt.toLocaleTimeString('en-US', {
														hour: '2-digit',
														minute: '2-digit'
													})}
												</div>
											</div>
										{:else}
											N/A
										{/if}
									</td>
									<td class="px-6 py-4 text-sm text-gray-900">
										{#if response.submittedAt}
											<div>
												<div>
													{response.submittedAt.toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'short',
														day: 'numeric'
													})}
												</div>
												<div class="text-xs text-gray-500">
													{response.submittedAt.toLocaleTimeString('en-US', {
														hour: '2-digit',
														minute: '2-digit'
													})}
												</div>
											</div>
										{:else}
											N/A
										{/if}
									</td>
									<td class="px-4 py-4 text-sm text-black">
										{#if response.status === 'DRAFT'}
											<span class="rounded-lg bg-yellow-300 px-2 py-1 text-yellow-800">Draft</span>
										{:else if response.status === 'SUBMITTED'}
											<span class="rounded-lg bg-blue-300 px-2 py-1 text-blue-800">Submitted</span>
										{:else if response.status === 'UNDER_REVIEW'}
											<span class="rounded-lg bg-purple-300 px-2 py-1 text-purple-800">
												Under Review
											</span>
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
										{#if response.aggregateRating !== -1}
											<div class="space-y-1">
												<p class="text-sm font-semibold text-blue-600">
													{response.aggregateRating.toFixed(1)}/10
												</p>

												<div class="flex">
													{#each Array(5) as _, i}
														{#if i < Math.round(response.aggregateRating / 2)}
															<svg class="h-4 w-4 fill-current text-yellow-400" viewBox="0 0 20 20">
																<path
																	d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																/>
															</svg>
														{:else}
															<svg class="h-4 w-4 fill-current text-gray-300" viewBox="0 0 20 20">
																<path
																	d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																/>
															</svg>
														{/if}
													{/each}
												</div>
												<!-- Review Count -->
												<div class="text-xs text-gray-500">
													{response.reviewCount} review{response.reviewCount !== 1 ? 's' : ''}
												</div>
											</div>
										{:else}
											<div class="text-xs text-gray-400">No reviews</div>
										{/if}
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

			<!-- Pagination Controls -->
			{#if pagination && pagination.totalPages > 1}
				<div class="flex items-center justify-between border-t border-gray-200 px-6 py-4">
					<!-- First button on the left -->
					<button
						onclick={async () => await goToPage(1)}
						disabled={pagination.currentPage === 1}
						class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						First
					</button>

					<!-- Center section with Previous, Page Numbers, and Next -->
					<div class="flex items-center space-x-2">
						<button
							onclick={async () => await goToPage(pagination.currentPage - 1)}
							disabled={pagination.currentPage === 1}
							class="btn-red rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
						>
							Previous
						</button>

						<div class="flex items-center space-x-1">
							{#each getPageNumbers() as pageNum}
								<button
									onclick={async () => await goToPage(pageNum)}
									class="rounded-md px-3 py-2 text-sm font-medium {pageNum ===
									pagination.currentPage
										? 'bg-blue-600 text-white'
										: 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}"
								>
									{pageNum}
								</button>
							{/each}
						</div>

						<button
							onclick={async () => await goToPage(pagination.currentPage + 1)}
							disabled={pagination.currentPage === pagination.totalPages}
							class="btn-blue rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next
						</button>
					</div>

					<!-- Last button on the right -->
					<button
						onclick={async () => await goToPage(pagination.totalPages)}
						disabled={pagination.currentPage === pagination.totalPages}
						class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Last
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
