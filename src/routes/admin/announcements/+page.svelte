<script lang="ts">
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { user, announcements, error } = data;

	let announcementsList = $state(announcements || []);
</script>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`Welcome to the admin dashboard, ${user.firstName}!`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Manage Announcements</h2>
			<p class="mb-4 text-sm text-gray-600">
				Add and view announcements for the application portal.
			</p>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();

						if (result.type === 'success' && result.data?.announcement) {
							// @ts-expect-error
							announcementsList = [...announcementsList, result.data.announcement];
						}
					};
				}}
				class="mb-6"
			>
				<div class="mb-4">
					<label for="title" class="block text-sm font-medium text-gray-700">Title:</label>
					<input
						type="text"
						id="title"
						name="title"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="message" class="block text-sm font-medium text-gray-700">Message:</label>
					<textarea
						id="message"
						name="message"
						rows="3"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						required
					></textarea>
				</div>
				<button
					type="submit"
					class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
				>
					Add Announcement
				</button>
			</form>

			{#if error}
				<p class="mb-4 text-center text-red-500">{error}</p>
			{/if}

			{#if form?.error}
				<p class="mb-4 text-center text-red-500">{form.error}</p>
			{/if}

			{#if !announcementsList || announcementsList.length === 0}
				<p class="text-center text-gray-500">No announcements found.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Title</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Content</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each announcementsList as announcement}
								<tr class="hover:bg-gray-100">
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
										>{announcement.title}</td
									>
									<td class="px-6 py-4 text-sm text-gray-900">{announcement.message}</td>
									<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
										<form
											method="POST"
											use:enhance={() => {
												return async ({ result, update }) => {
													await update();
													if (result.type === 'success') {
														announcementsList = announcementsList.filter(
															(a) => a.id !== announcement.id
														);
													}
												};
											}}
											action="?/delete"
										>
											<input type="hidden" name="announcementId" value={announcement.id} />
											<button
												type="submit"
												class="rounded bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
												>Delete</button
											>
										</form>
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
