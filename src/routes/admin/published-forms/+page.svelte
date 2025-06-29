<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	let { data }: PageProps = $props();
	let { publishedForms, error } = data;
</script>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`View Published Application Forms`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Published Application Forms</h2>
			<p class="mb-4 text-sm text-gray-600">
				Published application forms, when active, can be accessed by students.
				<br />
				They cannot be edited, but can be deactivated and republished from a draft.
			</p>
			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if !publishedForms || publishedForms.length === 0}
				<p class="text-center text-gray-500">No published application forms found</p>
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
									Created
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
							{#each publishedForms as form}
								<tr class="hover:bg-gray-100">
									<Tooltip tip={form.id} right>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
											>{form.id.slice(0, 6)}...</td
										>
									</Tooltip>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{form.name}</td>
									<td class="px-6 py-4 text-sm text-gray-900">{form.description ?? 'N/A'}</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{form.publishedAt.toLocaleDateString()} <br />
										{form.publishedAt.toLocaleTimeString()}</td
									>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{form.active ? 'Yes' : 'No'}</td
									>

									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<a
											href={`/admin/published-forms/${form.id}`}
											class="mr-2 inline-block rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
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
