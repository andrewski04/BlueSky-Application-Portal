<script lang="ts">
	import type { PageData } from './$types';
	import NavBar from '$lib/components/dashboard/NavBar.svelte';

	let { data }: { data: PageData } = $props();
	let { user, error, applicationForms } = data;
</script>

<svelte:head>
	<title>User Dashboard</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<NavBar message={`Welcome, ${user.firstName}!`}>
		<a href="/user/dashboard" class="underline hover:font-bold">Applications</a>
		<a href="/user/settings" class="hover:font-bold">Settings</a>
	</NavBar>

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if !applicationForms || applicationForms.length === 0}
				<p class="text-center text-gray-500">No application forms found</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
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
									Active
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each applicationForms as form}
								<tr class="hover:bg-gray-100">
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{form.name}</td>
									<td class="px-6 py-4 text-sm text-gray-900">{form.description ?? 'N/A'}</td>

									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{form.active ? 'Yes' : 'No'}
									</td>
									<td class="flex space-x-2 px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<a
											href="/application/{form.id}/{form.sections[0].slug}"
											class="rounded bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700"
										>
											Start Form
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
