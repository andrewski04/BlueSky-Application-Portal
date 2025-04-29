<script lang="ts">
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();
	const { users, error, currentUser } = data;
</script>

<div class="flex min-h-screen flex-col items-center bg-gray-900 p-6 text-white">
	<h2 class="mb-4 text-2xl font-semibold">User List</h2>

	<div class="w-full max-w-lg rounded-lg bg-gray-800 p-4 shadow-md">
		{#if users.length === 0}
			<p class="text-center text-gray-400">No users found</p>
		{:else}
			<ul class="divide-y divide-gray-700">
				{#each users as user}
					<li class="p-3 transition hover:bg-gray-700">
						<p class="mb-1 text-lg font-medium">
							{user.email}
							{#if user.id == currentUser?.id}(Current User){/if}
						</p>
						<p class="text-md text-gray-300">Role: {user.role}</p>
						<p class="text-md text-gray-300">First name: {user.firstName ?? 'N/A'}</p>
						<p class="text-md text-gray-300">Last name: {user.lastName ?? 'N/A'}</p>
						<p class="mt-2 text-sm text-gray-400">ID: {user.id}</p>
					</li>
				{/each}
			</ul>
		{/if}

		{#if error}
			<p class="mt-4 text-center text-red-400">{error}</p>
		{/if}
	</div>
</div>
