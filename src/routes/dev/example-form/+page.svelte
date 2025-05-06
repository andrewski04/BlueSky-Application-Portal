<script lang="ts">
	import type { PageData } from './$types';
	import type { ApplicationForm, Prisma } from '@prisma/client';

	const { data }: { data: PageData } = $props();
	// Cast data to the expected type including the sections relation
	const { applicationForms, error } = data as {
		applicationForms: Prisma.ApplicationFormGetPayload<{ include: { sections: true } }>[];
		error?: string;
	};

	// Function to generate section slug
	function getSectionSlug(sectionName: string): string {
		return sectionName.toLowerCase().replace(/\s+/g, '-');
	}
</script>

<svelte:head>
	<title>Manage Example Forms</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center bg-gray-900 p-6 text-white">
	<h2 class="text-2xl font-semibold">Application Forms</h2>
	<p class="mt-4 text-sm">Create an example form with sections and different question types.</p>

	<form method="POST" action="?/create" class="my-4">
		<button
			type="submit"
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		>
			Create Example Form
		</button>
	</form>

	{#if error}
		<p class="text-center text-red-400">{error}</p>
	{/if}

	<div class="mt-4 w-full max-w-5xl rounded-lg bg-gray-800 p-4 shadow-md">
		{#if applicationForms.length === 0}
			<p class="text-center text-gray-400">No application forms found</p>
		{:else}
			<table class="min-w-full divide-y divide-gray-700">
				<thead>
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
						>
							ID
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
						>
							Name
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
						>
							Description
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
						>
							Published
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
						>
							Active
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-700">
					{#each applicationForms as form}
						<tr class="hover:bg-gray-700">
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-400">{form.id}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-300">{form.name}</td>
							<td class="px-6 py-4 text-sm text-gray-300">{form.description ?? 'N/A'}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
								{form.published ? 'Yes' : 'No'}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
								{form.active ? 'Yes' : 'No'}
							</td>
							<td class="flex space-x-2 px-6 py-4 text-sm whitespace-nowrap text-gray-300">
								{#if form.sections.length > 0}
									<a
										href={`/application/${form.id}/${getSectionSlug(form.sections[0].name)}`}
										class="rounded bg-green-500 px-3 py-1 text-xs font-bold text-white hover:bg-green-700"
									>
										View Form
									</a>
								{/if}
								<form method="POST" action="?/delete">
									<input type="hidden" name="formId" value={form.id} />
									<button
										type="submit"
										class="rounded bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
									>
										Delete
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
