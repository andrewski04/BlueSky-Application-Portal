<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import { UserRole } from '@prisma/client';

	const { data, form }: PageProps = $props();
	const { users, error } = data;

	// Function to get the opposite role
	function getOppositeRole(currentRole: string): UserRole {
		return currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
	}

	// Function to get button text based on current role
	function getButtonText(currentRole: string): string {
		return currentRole === UserRole.ADMIN ? 'Set User Role' : 'Set Admin Role';
	}
</script>

<svelte:head>
	<title>Manage Users</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center bg-gray-900 p-6 text-white">
	<h2 class=" text-2xl font-semibold">User List</h2>

	{#if error}
		<p class=" text-center text-red-400">{error}</p>
	{/if}

	{#if form?.error}
		<p class="text-center text-red-400">{form.error}</p>
	{/if}

	{#if form?.success}
		<p class="text-center text-green-400">User role updated successfully!</p>
	{/if}

	<div class="mt-4 w-full max-w-lg rounded-lg bg-gray-800 p-4 shadow-md">
		{#if users.length === 0}
			<p class="text-center text-gray-400">No users found</p>
		{:else}
			<ul class="divide-y divide-gray-700">
				{#each users as user}
					<li class="p-3 transition hover:bg-gray-700">
						<p class="mb-1 text-lg font-medium">
							{user.email}
						</p>
						<p class="text-md text-gray-300">Role: {user.role}</p>
						<p class="text-md text-gray-300">First name: {user.firstName ?? 'N/A'}</p>
						<p class="text-md text-gray-300">Last name: {user.lastName ?? 'N/A'}</p>
						<p class="text-md text-gray-300">Completed Setup: {user.isSetup ? 'Yes' : 'No'}</p>
						<p class="mt-2 text-sm text-gray-400">ID: {user.id}</p>

						<form method="POST" action="?/updateRole">
							<input type="hidden" name="userId" value={user.id} />
							<input type="hidden" name="newRole" value={getOppositeRole(user.role)} />
							<button
								type="submit"
								class="hover:bg-opacity-90 mt-2 rounded px-3 py-1 text-sm font-medium text-white focus:ring-2 focus:outline-none {user.role ===
								UserRole.ADMIN
									? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
									: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}"
							>
								{getButtonText(user.role)}
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
