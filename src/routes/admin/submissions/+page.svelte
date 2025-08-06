<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	let { data }: { data: PageData } = $props();
	let { error, applicationResponses } = data;
</script>

<svelte:head>
	<title>Application Submissions Overview</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`View Student Application Submissions`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Application Submissions</h2>

			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if !applicationResponses || applicationResponses.length === 0}
				<p class="text-center text-gray-500">No application submissions found</p>
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
									User
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Last Updated
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Status
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each applicationResponses as response}
								<tr class="hover:bg-gray-100">
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{response.id.slice(0, 6)}...</td
									>

									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{response.user.lastName}, {response.user.firstName}</td
									>
									<td class="px-6 py-4 text-sm text-gray-900"
										>{response.updatedAt.toLocaleString('en-US', {
											timeZoneName: 'shortGeneric'
										}) ??
											response.createdAt ??
											'N/A'}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										{response.status}
									</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<a
											href="/admin/submissions/{response.id}"
											class="btn-bluebg-green-500 px-4 py-1 text-white hover:bg-green-700"
										>
											View
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
