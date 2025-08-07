<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	let { data }: PageProps = $props();
	let { users = [], error } = data;

	// Add search state
	let search = $state('');

	// Add role filter state
	let roleFilter = $state<'all' | 'USER' | 'ADMIN'>('all');

	// Add setup status filter state
	let setupFilter = $state<'all' | 'setup' | 'not-setup'>('all');

	// Filtered users state
	let filteredUsers = $state(users);

	// Sorting state
	let sortKey = $state<
		| 'id'
		| 'email'
		| 'firstName'
		| 'lastName'
		| 'role'
		| 'isSetup'
		| 'createdAt'
		| 'sessions'
		| 'responses'
	>('createdAt');
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
		let userList = users;

		// Search filter
		if (search) {
			const q = search.toLowerCase();
			userList = userList.filter((user) => {
				return (
					user.email?.toLowerCase().includes(q) ||
					user.id?.toLowerCase().includes(q) ||
					user.firstName?.toLowerCase().includes(q) ||
					user.lastName?.toLowerCase().includes(q)
				);
			});
		}

		// Role filter
		if (roleFilter === 'USER') {
			userList = userList.filter((user) => user.role === 'USER');
		} else if (roleFilter === 'ADMIN') {
			userList = userList.filter((user) => user.role === 'ADMIN');
		}

		// Setup status filter
		if (setupFilter === 'setup') {
			userList = userList.filter((user) => user.isSetup);
		} else if (setupFilter === 'not-setup') {
			userList = userList.filter((user) => !user.isSetup);
		}

		// Sorting
		userList = [...userList].sort((a, b) => {
			let aVal: any;
			let bVal: any;

			// Handle different sort keys
			if (sortKey === 'sessions') {
				aVal = a._count.sessions;
				bVal = b._count.sessions;
			} else if (sortKey === 'responses') {
				aVal = a._count.ApplicationResponse;
				bVal = b._count.ApplicationResponse;
			} else if (sortKey === 'createdAt') {
				aVal = a.createdAt ? a.createdAt.getTime() : 0;
				bVal = b.createdAt ? b.createdAt.getTime() : 0;
			} else {
				// Handle other properties that exist directly on the user object
				aVal = a[sortKey as keyof typeof a];
				bVal = b[sortKey as keyof typeof b];
			}

			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		filteredUsers = userList;
	});
</script>

<svelte:head>
	<title>Manage Users</title>
</svelte:head>

<div class="main-container min-h-screen">
	<AdminNavBar message={`User Management`} />

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
							d="M11 15C10.1183 15 9.28093 14.8098 8.52682 14.4682C8.00429 14.2315 7.74302 14.1131 7.59797 14.0722C7.4472 14.0297 7.35983 14.0143 7.20361 14.0026C7.05331 13.9914 6.94079 14 6.71575 14.0172C6.6237 14.0242 6.5425 14.0341 6.46558 14.048C5.23442 14.2709 4.27087 15.2344 4.04798 16.4656C4 16.7306 4 17.0485 4 17.6841V19.4C4 19.9601 4 20.2401 4.10899 20.454C4.20487 20.6422 4.35785 20.7951 4.54601 20.891C4.75992 21 5.03995 21 5.6 21H8.4M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7ZM12.5898 21L14.6148 20.595C14.7914 20.5597 14.8797 20.542 14.962 20.5097C15.0351 20.4811 15.1045 20.4439 15.1689 20.399C15.2414 20.3484 15.3051 20.2848 15.4324 20.1574L19.5898 16C20.1421 15.4477 20.1421 14.5523 19.5898 14C19.0376 13.4477 18.1421 13.4477 17.5898 14L13.4324 18.1574C13.3051 18.2848 13.2414 18.3484 13.1908 18.421C13.1459 18.4853 13.1088 18.5548 13.0801 18.6279C13.0478 18.7102 13.0302 18.7985 12.9948 18.975L12.5898 21Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					User Management
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					Manage user accounts, roles, and view user activity.
					<br />
					You can search, filter, and sort users by various criteria.
				</p>
			</div>

			<!-- Search bar and filters -->
			<div class="flex items-end justify-between px-6 pt-4">
				<input
					type="text"
					placeholder="Search by email, name, or ID..."
					bind:value={search}
					class="search-input w-full max-w-xs px-3 py-2 text-sm focus:outline-none"
				/>
				<div class="flex gap-2">
					<select
						bind:value={roleFilter}
						class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
					>
						<option value="all">All Roles</option>
						<option value="USER">Users</option>
						<option value="ADMIN">Admins</option>
					</select>
					<select
						bind:value={setupFilter}
						class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
					>
						<option value="all">All Status</option>
						<option value="setup">Setup Complete</option>
						<option value="not-setup">Not Setup</option>
					</select>
				</div>
			</div>

			{#if error}
				<p class="mb-4 text-center font-bold text-red-500">{error}</p>
			{/if}

			<hr class="my-4 h-px border-0 bg-[rgb(59,130,246)]/10" />

			<div class="w-full overflow-hidden rounded-b-lg shadow-md">
				<div class="space-y-4 rounded-b-lg">
					{#if !filteredUsers || filteredUsers.length === 0}
						<p class="pb-4 text-center text-gray-500">No users found</p>
					{/if}
				</div>
				{#if filteredUsers && filteredUsers.length > 0}
					<div class="overflow-x-auto">
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
										onclick={() => setSort('email')}
									>
										Email {sortKey === 'email' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('firstName')}
									>
										First Name {sortKey === 'firstName'
											? sortDirection === 'asc'
												? '▲'
												: '▼'
											: ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('lastName')}
									>
										Last Name {sortKey === 'lastName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('role')}
									>
										Role {sortKey === 'role' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('isSetup')}
									>
										Setup {sortKey === 'isSetup' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('createdAt')}
									>
										Created {sortKey === 'createdAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('sessions')}
									>
										Active Sessions {sortKey === 'sessions'
											? sortDirection === 'asc'
												? '▲'
												: '▼'
											: ''}
									</th>
									<th
										class="cursor-pointer p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('responses')}
									>
										Responses {sortKey === 'responses' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each filteredUsers as user}
									<tr class="hover:bg-gray-100">
										<td class="px-4 py-4 text-sm text-black">{user.id.slice(0, 6)}...</td>
										<td class="px-4 py-4 text-sm text-black">{user.email}</td>
										<td class="px-4 py-4 text-sm text-black">{user.firstName ?? 'N/A'}</td>
										<td class="px-4 py-4 text-sm text-black">{user.lastName ?? 'N/A'}</td>
										<td class="px-4 py-4 text-sm text-black">
											<span
												class={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
													user.role === 'ADMIN'
														? 'bg-red-100 text-red-800'
														: 'bg-blue-100 text-blue-800'
												}`}
											>
												{user.role}
											</span>
										</td>
										<td class="px-4 py-4 text-sm text-black">
											<span
												class={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
													user.isSetup
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{user.isSetup ? 'Complete' : 'Pending'}
											</span>
										</td>
										<td class="px-4 py-4 text-sm text-black"
											>{user.createdAt.toLocaleDateString()} <br />
											{user.createdAt.toLocaleTimeString()}</td
										>
										<td class="px-4 py-4 text-sm text-black">
											{user._count.sessions}
										</td>
										<td class="px-4 py-4 text-sm text-black">
											{user._count.ApplicationResponse}
										</td>
										<td class="px-4 py-4 text-sm text-black">
											<a
												class="btn-green flex items-center justify-center px-4 py-2"
												href={`/admin/users/${user.id}`}
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
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
