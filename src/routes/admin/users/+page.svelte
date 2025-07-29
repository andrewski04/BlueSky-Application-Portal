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

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`User Management`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-7xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">User Management</h2>
			<p class="mb-4 text-sm text-gray-600">
				Manage user accounts, roles, and view user activity.
				<br />
				You can search, filter, and sort users by various criteria.
			</p>

			<!-- Search bar and filters -->
			<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<input
					type="text"
					placeholder="Search by email, name, or ID..."
					bind:value={search}
					class="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
				<div class="flex gap-2">
					<select
						bind:value={roleFilter}
						class="rounded border border-gray-300 bg-blue-500 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
					>
						<option value="all">All Roles</option>
						<option value="USER">Users</option>
						<option value="ADMIN">Admins</option>
					</select>
					<select
						bind:value={setupFilter}
						class="rounded border border-gray-300 bg-blue-500 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
					>
						<option value="all">All Status</option>
						<option value="setup">Setup Complete</option>
						<option value="not-setup">Not Setup</option>
					</select>
				</div>
			</div>

			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if !filteredUsers || filteredUsers.length === 0}
				<p class="text-center text-gray-500">No users found</p>
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
									onclick={() => setSort('email')}
								>
									Email {sortKey === 'email' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('firstName')}
								>
									First Name {sortKey === 'firstName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('lastName')}
								>
									Last Name {sortKey === 'lastName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('role')}
								>
									Role {sortKey === 'role' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('isSetup')}
								>
									Setup {sortKey === 'isSetup' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('createdAt')}
								>
									Created {sortKey === 'createdAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
								</th>
								<th
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase select-none"
									onclick={() => setSort('sessions')}
								>
									Active Sessions {sortKey === 'sessions'
										? sortDirection === 'asc'
											? '▲'
											: '▼'
										: ''}
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
							{#each filteredUsers as user}
								<tr class="hover:bg-gray-100">
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{user.id.slice(0, 6)}...</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{user.email}</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{user.firstName ?? 'N/A'}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{user.lastName ?? 'N/A'}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
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
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
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
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{user.createdAt.toLocaleDateString()} <br />
										{user.createdAt.toLocaleTimeString()}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{user._count.sessions}
									</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{user._count.ApplicationResponse}
									</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<a
											class="mr-2 inline-block rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
											href={`/admin/users/${user.id}`}
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
