<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	let { data }: PageProps = $props();
	let { currentUser, user, responses } = data;

	// State for user management
	let isDisablingUser = $state(false);
	let showDisableConfirmation = $state(false);

	function handleDisableUser() {
		showDisableConfirmation = true;
	}

	function confirmDisableUser() {
		isDisablingUser = true;
		// TODO: Implement actual user disable functionality
		setTimeout(() => {
			isDisablingUser = false;
			showDisableConfirmation = false;
			alert('User disable functionality will be implemented in a future update.');
		}, 1000);
	}

	function cancelDisableUser() {
		showDisableConfirmation = false;
	}

	function getFullName() {
		const firstName = user.firstName || '';
		const lastName = user.lastName || '';
		return `${firstName} ${lastName}`.trim() || 'Not provided';
	}
</script>

<svelte:head>
	<title>User Management - {user.email}</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`User Management - ${user.email}`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-6xl space-y-6">
			<!-- User Information Card -->
			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-2xl font-semibold text-gray-800">User Information</h2>
					<a
						href="/admin/users"
						class="rounded bg-gray-500 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600"
					>
						← Back to Users
					</a>
				</div>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<!-- Basic Information -->
					<div class="space-y-4">
						<div>
							<p class="block text-sm font-medium text-gray-700">User ID</p>
							<p class="mt-1 text-sm text-gray-900">{user.id}</p>
						</div>

						<div>
							<p class="block text-sm font-medium text-gray-700">Email</p>
							<p class="mt-1 text-sm text-gray-900">{user.email}</p>
						</div>

						<div>
							<p class="block text-sm font-medium text-gray-700">Full Name</p>
							<p class="mt-1 text-sm text-gray-900">{getFullName()}</p>
						</div>

						<div>
							<p class="block text-sm font-medium text-gray-700">Role</p>
							<span
								class={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
									user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
								}`}
							>
								{user.role}
							</span>
						</div>
					</div>

					<!-- Account Status -->
					<div class="space-y-4">
						<div>
							<p class="block text-sm font-medium text-gray-700">Account Setup</p>
							<span
								class={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
									user.isSetup ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
								}`}
							>
								{user.isSetup ? 'Complete' : 'Pending'}
							</span>
						</div>

						<div>
							<p class="block text-sm font-medium text-gray-700">Account Created</p>
							<p class="mt-1 text-sm text-gray-900">
								{user.createdAt.toLocaleDateString()} at {user.createdAt.toLocaleTimeString()}
							</p>
						</div>

						<div>
							<p class="block text-sm font-medium text-gray-700">Active Sessions</p>
							<p class="mt-1 text-sm text-gray-900">{user._count.sessions}</p>
						</div>

						<div>
							<p class="block text-sm font-medium text-gray-700">Form Responses</p>
							<p class="mt-1 text-sm text-gray-900">{user._count.ApplicationResponse}</p>
						</div>
					</div>
				</div>

				<!-- User Management Actions -->
				<div class="mt-6 border-t border-gray-200 pt-6">
					<h3 class="mb-4 text-lg font-medium text-gray-800">User Management</h3>
					<div class="flex flex-wrap gap-3">
						<button
							onclick={handleDisableUser}
							disabled={isDisablingUser}
							class="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
						>
							{isDisablingUser ? 'Processing...' : 'Disable User'}
						</button>
					</div>
				</div>
			</div>

			<!-- Form Responses Card -->
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h3 class="mb-4 text-xl font-semibold text-gray-800">Form Responses</h3>

				{#if responses.length === 0}
					<p class="text-center text-gray-500">No form responses found for this user.</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead>
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>
										Response ID
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>
										Form Name
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>
										Form Description
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>
										Submitted
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>
										Last Updated
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each responses as response}
									<tr class="hover:bg-gray-100">
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
											>{response.id.slice(0, 6)}...</td
										>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
											>{response.form.name}</td
										>
										<td class="px-6 py-4 text-sm text-gray-900"
											>{response.form.description ?? 'N/A'}</td
										>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
											>{response.createdAt.toLocaleDateString()} <br />
											{response.createdAt.toLocaleTimeString()}</td
										>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
											>{response.updatedAt.toLocaleDateString()} <br />
											{response.updatedAt.toLocaleTimeString()}</td
										>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
											<a
												href={`/admin/submissions/${response.id}`}
												class="mr-2 inline-block rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
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
</div>

<!-- Disable User Confirmation Modal -->
{#if showDisableConfirmation}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-xl font-semibold text-gray-800">Confirm User Disable</h3>
			<p class="mb-6 text-sm text-gray-600">
				Are you sure you want to disable this user? This action will prevent the user from logging
				in and accessing the system.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={cancelDisableUser}
					class="rounded bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400"
				>
					Cancel
				</button>
				<button
					onclick={confirmDisableUser}
					class="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
				>
					Disable User
				</button>
			</div>
		</div>
	</div>
{/if}
