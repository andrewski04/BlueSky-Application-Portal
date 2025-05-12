<script lang="ts">
	import type { PageData } from './$types';
	import NavBar from '$lib/components/dashboard/NavBar.svelte';
	let { data }: { data: PageData } = $props();

	let { user, applicationForms, error } = data;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<NavBar message={`Welcome to the admin dashboard, ${user.firstName}!`}>
		<a href="/admin/dashboard" class="underline hover:font-bold">Forms</a>
		<a href="/admin/submissions" class="hover:font-bold">Submissions</a>
		<a href="/admin/users" class="hover:font-bold">Users</a>
		<a href="/admin/settings" class="hover:font-bold">Settings</a>
	</NavBar>

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Application Forms</h2>
			<p class="mb-4 text-sm text-gray-600">
				Create an example form with sections and different question types.
			</p>

			<form method="POST" action="?/create" class="mb-6">
				<button
					type="submit"
					class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
				>
					Create Example Form
				</button>
			</form>

			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if applicationForms.length === 0}
				<p class="text-center text-gray-500">No application forms found</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									ID
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Name
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Description
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Published
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Active
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each applicationForms as form}
								<tr class="hover:bg-gray-100">
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{form.id}</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{form.name}</td>
									<td class="px-6 py-4 text-sm text-gray-900">{form.description ?? 'N/A'}</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{form.published ? 'Yes' : 'No'}
									</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{form.active ? 'Yes' : 'No'}
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
