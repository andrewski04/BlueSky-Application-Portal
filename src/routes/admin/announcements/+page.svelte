<script lang="ts">
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { user, announcements, error } = data;

	let announcementsList = $state(announcements || []);
</script>

<div class="main-container min-h-screen">
	<AdminNavBar message={`Welcome to the admin dashboard, ${user.firstName}!`} />

	<div class="mx-auto max-w-6xl px-4 py-8">
		<div class="content-card mb-8">
			<div class="section-header p-6">
				<h2 class="flex items-center text-xl font-semibold text-gray-800">
					<svg
						class="mr-3 h-6 w-6 text-blue-600"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							d="M11,15 C14,15 19,19 19,19 L19,3 C19,3 14,7 11,7 C11,7 11,15 11,15 Z M5,15 L8,23 L12,23 L9,15 M19,14 C20.657,14 22,12.657 22,11 C22,9.343 20.657,8 19,8 M11,19 C11.9999997,18.9999994 14,18 14,16 M2,11 C2,7.88888889 3.7912,7 6,7 L11,7 L11,15 L6,15 C3.7912,15 2,14.1111111 2,11 Z"
						/>
					</svg>
					Manage Announcements
				</h2>
			</div>

			<div class="px-6 pt-4">
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
						<label for="title" class="block font-medium text-gray-700">Title</label>
						<input
							type="text"
							id="title"
							name="title"
							maxlength={100}
							minlength={5}
							class="mt-1 block w-full rounded-md border-gray-300 px-2 py-1 shadow-sm focus:outline-2 focus:outline-blue-500"
							required
						/>
					</div>
					<div class="mb-4">
						<label for="message" class="block font-medium text-gray-700">Message</label>
						<textarea
							id="message"
							name="message"
							maxlength={800}
							minlength={10}
							rows="3"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						></textarea>
					</div>
					<button
						type="submit"
						class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-blue-700"
					>
						Add Announcement
					</button>
				</form>

				{#if error}
					<div class="mx-auto mb-4 max-w-sm rounded-2xl bg-red-500 px-4 py-2">
						<p class="text-center text-white">{error}</p>
					</div>
				{/if}

				{#if form?.error}
					<div class="mx-auto mb-4 max-w-sm rounded-2xl bg-red-500 px-4 py-2">
						<p class="text-center text-white">{form.error}</p>
					</div>
				{/if}
			</div>

			<hr class="my-4 h-px border-0 bg-[rgb(59,130,246)]/10" />

			<!-- Table -->
			<div class="w-full rounded-b-lg shadow-md">
				<div class="space-y-4 rounded-b-lg">
					{#if !announcementsList || announcementsList.length === 0}
						<p class="pb-4 text-center text-gray-500">No announcements found</p>
					{/if}
				</div>
				{#if announcementsList && announcementsList.length > 0}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="w-1/4 p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
								>
									Title
								</th>
								<th
									class="p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
								>
									Content
								</th>
								<th
									class="w-auto p-4 pt-0 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each announcementsList as announcement}
								<tr class="hover:bg-gray-100">
									<td class="px-4 py-4 text-sm whitespace-nowrap text-black"
										>{announcement.title}</td
									>
									<td class="max-w-md px-4 py-4 text-sm break-words text-black"
										>{announcement.message}</td
									>

									<td class="px-4 py-4 text-center text-sm whitespace-nowrap text-black">
										<form
											method="POST"
											class="flex items-center justify-center"
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
												class="btn-red flex items-center justify-center px-4 py-2"
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
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													></path>
												</svg>
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
	</div>
</div>
