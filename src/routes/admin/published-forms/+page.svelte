<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import ActionDropdown from '$lib/components/util/ActionDropdown.svelte';
	import { enhance } from '$app/forms';
	import nProgress from 'nprogress';
	import { addNotif } from '$lib/utils/notify';

	let { data }: PageProps = $props();
	let publishedForms = $state(data.publishedForms);

	// Quick actions state
	let showStatusConfirm = $state<{ formId: string; action: string; active: boolean } | null>(null);
	let showArchiveConfirm = $state<{ formId: string; action: string; archived: boolean } | null>(
		null
	);

	// Add search state
	let search = $state('');

	// Add status filter state
	let statusFilter = $state<'all' | 'active' | 'inactive' | 'archived'>('all');

	// Add archived forms toggle state
	let showArchived = $state(false);

	// Sorting state
	let sortKey = $state<
		'id' | 'name' | 'adminName' | 'publishedAt' | 'status' | 'responses' | 'openDate' | 'closeDate'
	>('publishedAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	function setSort(key: typeof sortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	const statusMessages = {
		archived: 'No archived published application forms found',
		inactive: 'No inactive published application forms found',
		active: 'No active published application forms found',
		all: 'No published application forms found'
	};

	// Filtered forms state
	let filteredForms = $derived.by(() => {
		let forms = publishedForms;
		if (search) {
			const q = search.toLowerCase();
			forms = forms.filter((form) => {
				return (
					form.name?.toLowerCase().includes(q) ||
					form.adminName?.toLowerCase().includes(q) ||
					form.id?.toLowerCase().includes(q) ||
					form.description?.toLowerCase().includes(q)
				);
			});
		}
		// Status filter
		if (statusFilter === 'active') {
			forms = forms.filter((form) => form.active && !form.archived);
		} else if (statusFilter === 'inactive') {
			forms = forms.filter((form) => !form.active && !form.archived);
		} else if (statusFilter === 'archived') {
			forms = forms.filter((form) => form.archived);
		} else {
			// 'all' status - filter based on showArchived toggle
			if (!showArchived) {
				forms = forms.filter((form) => !form.archived);
			}
		}
		// Sorting
		forms = [...forms].sort((a, b) => {
			let aVal: any;
			let bVal: any;

			if (sortKey === 'status') {
				// For status sorting, we need to determine the status value
				const getStatusValue = (form: any) => {
					if (form.archived) return 3; // Archived (highest priority)
					if (form.active) return 1; // Active
					return 2; // Inactive
				};
				aVal = getStatusValue(a);
				bVal = getStatusValue(b);
			} else if (sortKey === 'publishedAt' || sortKey === 'openDate' || sortKey === 'closeDate') {
				aVal = a[sortKey] ? (a[sortKey]?.getTime() ?? 0) : 0;
				bVal = b[sortKey] ? (b[sortKey]?.getTime() ?? 0) : 0;
			} else {
				aVal = a[sortKey];
				bVal = b[sortKey];
			}

			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
		return forms;
	});

	function handleQuickAction(action: string, formId: string, active: boolean, archived: boolean) {
		if (action === 'toggleStatus') {
			showStatusConfirm = { formId, action: 'toggleStatus', active: !active };
		} else if (action === 'toggleArchive') {
			showArchiveConfirm = { formId, action: 'toggleArchive', archived: !archived };
		}
	}
</script>

<svelte:head>
	<title>Published Application Forms</title>
</svelte:head>

<div class="main-container min-h-screen">
	<AdminNavBar message={`View Published Application Forms`} />

	<div class="container mx-auto px-4 py-8">
		<div class="content-card mb-8">
			<div class="section-header p-6">
				<h2 class="flex items-center text-xl font-semibold text-gray-800">
					<svg
						class="mr-3 h-6 w-6 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="-1.9 0 19.00 19.00"
					>
						<g>
							<path
								fill="currentColor"
								stroke="currentColor"
								stroke-width="0.2"
								d="M11.16 16.153a.477.477 0 0 1-.476.475H1.316a.477.477 0 0 1-.475-.475V3.046a.477.477 0 0 1 .475-.475h6.95l2.893 2.893zm-1.11-9.924H8.059a.575.575 0 0 1-.574-.574V3.679H1.95v11.84h8.102zm-1.234 4a.554.554 0 0 1-.784 0L6.55 8.747v5.121a.554.554 0 0 1-1.108 0V8.747l-1.483 1.482a.554.554 0 0 1-.783-.784l2.428-2.428a.554.554 0 0 1 .783 0l2.429 2.428a.554.554 0 0 1 0 .784z"
							></path></g
						>
					</svg>Published Application Forms
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					Published application forms, when active, can be accessed by students.
					<br />
					They cannot be edited, but can be deactivated and republished from a draft.
				</p>
			</div>

			<div>
				<!-- Search bar and status filter -->
				<div class="flex items-end justify-between px-6 pt-4">
					<input
						type="text"
						placeholder="Search by display name, private name, id, or description..."
						bind:value={search}
						class="search-input w-full max-w-xs px-3 py-2 text-sm focus:outline-none"
					/>
					<div class="flex items-center gap-4">
						<button
							id="showArchived"
							onclick={() => (showArchived = !showArchived)}
							disabled={statusFilter !== 'all'}
							class="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 {statusFilter !==
							'all'
								? 'cursor-not-allowed opacity-50'
								: 'cursor-pointer'}"
						>
							<div
								class="h-4 w-4 rounded-md border-2 {showArchived
									? 'border-blue-800 bg-blue-500'
									: 'border-gray-500 bg-gray-300'}"
							></div>
							<p class="text-sm text-gray-700">Show archived</p>
						</button>
						<select
							bind:value={statusFilter}
							class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
						>
							<option value="all">All</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="archived">Archived</option>
						</select>
					</div>
				</div>

				<hr class="mt-4 h-px border-0 bg-[rgb(59,130,246)]/10" />

				<div class="w-full rounded-b-lg shadow-md">
					<div class="space-y-4 rounded-b-lg">
						{#if !filteredForms || filteredForms.length === 0}
							<p class="py-4 text-center text-gray-500">
								{statusMessages[statusFilter]}
							</p>
						{/if}
					</div>
					{#if filteredForms && filteredForms.length > 0}
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('id')}
									>
										ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('name')}
									>
										Display Name {sortKey === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('adminName')}
									>
										Private Name {sortKey === 'adminName'
											? sortDirection === 'asc'
												? '▲'
												: '▼'
											: ''}
									</th>

									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('publishedAt')}
									>
										Created {sortKey === 'publishedAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>

									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('status')}
									>
										Status {sortKey === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('openDate')}
									>
										Open Date {sortKey === 'openDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('closeDate')}
									>
										Close Date {sortKey === 'closeDate'
											? sortDirection === 'asc'
												? '▲'
												: '▼'
											: ''}
									</th>

									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
										onclick={() => setSort('responses')}
									>
										Responses {sortKey === 'responses' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th
										class="cursor-pointer p-4 text-left font-semibold tracking-wide text-nowrap text-gray-700 uppercase select-none"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each filteredForms as form}
									<tr class="hover:bg-gray-100">
										<td class="px-4 py-4 text-sm text-black">{form.id.slice(0, 6)}...</td>
										<td class="px-4 py-4 text-sm text-black">{form.name}</td>
										<td class="px-4 py-4 text-sm text-black">{form.adminName || 'N/A'}</td>
										<td class="px-4 py-4 text-sm text-black"
											>{form.publishedAt.toLocaleDateString()} <br />
											{form.publishedAt.toLocaleTimeString()}</td
										>
										<td class="px-4 py-4 text-sm text-black">
											{#if form.archived}
												<span class="rounded-lg bg-amber-300 px-2 py-1 text-amber-800"
													>Archived</span
												>
											{:else if form.active}
												<span class="rounded-lg bg-green-300 px-2 py-1 text-green-800">Active</span>
											{:else}
												<span class="rounded-lg bg-red-300 px-2 py-1 text-red-800">Inactive</span>
											{/if}
										</td>
										<td class="px-4 py-4 text-sm text-black">
											{#if form.openDate}
												{form.openDate.toLocaleDateString()} <br />
												{form.openDate.toLocaleTimeString()}
											{:else}
												N/A
											{/if}
											<br />
										</td>
										<td class="px-4 py-4 text-sm text-black">
											{#if form.closeDate}
												{form.closeDate.toLocaleDateString()} <br />
												{form.closeDate.toLocaleTimeString()}
											{:else}
												N/A
											{/if}
										</td>
										<td class="px-4 py-4 text-sm text-black">
											{form.responses.length}
										</td>
										<td class="px-4 py-4 text-sm text-black">
											<div class="flex items-center gap-2">
												<a
													href={`/admin/published-forms/${form.id}`}
													class="btn-green flex items-center justify-center px-4 py-2"
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
															d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
														></path>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
														></path>
													</svg>
													Manage
												</a>
												<div data-form-id={form.id}>
													<ActionDropdown
														actions={[
															{
																disabled: form.archived,
																label: form.active ? 'Deactivate' : 'Activate',
																action: 'toggleStatus',
																icon: '/icons/info.svg',
																variant: form.active ? 'danger' : 'success'
															},
															{
																label: form.archived ? 'Unarchive' : 'Archive',
																action: 'toggleArchive',
																icon: '/icons/info.svg',
																variant: form.archived ? 'success' : 'warning'
															}
														]}
														onAction={(action) =>
															handleQuickAction(action, form.id, form.active, form.archived)}
													/>
												</div>
											</div>
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
</div>

<!-- Status Change Confirmation Modal -->
{#if showStatusConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<form
			method="post"
			action={`?/updatePublishedFormActiveStatus`}
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
			use:enhance={({ formData }) => {
				nProgress.start();
				if (showStatusConfirm) {
					formData.append('formId', showStatusConfirm.formId);
					formData.append('active', showStatusConfirm.active.toString());
				}
				return async ({ result }) => {
					nProgress.done();
					if (result.type === 'success') {
						publishedForms = publishedForms.map((form) => {
							if (form.id === showStatusConfirm?.formId) {
								return { ...form, active: showStatusConfirm?.active };
							}
							return form;
						});

						addNotif(result.data?.message as string, 'success');
					} else if (result.type === 'failure') {
						addNotif(result.data?.error as string, 'error');
					}
					showStatusConfirm = null;
				};
			}}
		>
			<h3 class="mb-4 text-lg font-semibold text-gray-900">
				Confirm {showStatusConfirm.active ? 'Activate' : 'Deactivate'}
			</h3>
			<p class="mb-6 text-sm text-gray-600">
				Are you sure you want to {showStatusConfirm.active ? 'activate' : 'deactivate'} this form?
				{showStatusConfirm.active
					? 'It will become available for users to submit if the date range is open or unset.'
					: 'Users will no longer be able to submit to this form.'}
			</p>
			<div class="flex justify-end gap-3">
				<button type="button" class="btn-red px-4 py-2" onclick={() => (showStatusConfirm = null)}>
					Cancel
				</button>
				<button type="submit" class="btn-blue px-4 py-2">
					{showStatusConfirm.active ? 'Activate' : 'Deactivate'}
				</button>
			</div>
		</form>
	</div>
{/if}

<!-- Archive Change Confirmation Modal -->
{#if showArchiveConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<form
			method="post"
			action={`?/updatePublishedFormArchiveStatus`}
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
			use:enhance={({ formData }) => {
				nProgress.start();
				if (showArchiveConfirm) {
					formData.append('formId', showArchiveConfirm.formId);
					formData.append('archived', showArchiveConfirm.archived.toString());
				}
				return async ({ result }) => {
					nProgress.done();
					if (result.type === 'success') {
						publishedForms = publishedForms.map((form) => {
							if (form.id === showArchiveConfirm?.formId) {
								return { ...form, archived: showArchiveConfirm?.archived };
							}
							return form;
						});

						addNotif(result.data?.message as string, 'success');
					} else if (result.type === 'failure') {
						addNotif(result.data?.error as string, 'error');
					}
					showArchiveConfirm = null;
				};
			}}
		>
			<h3 class="mb-4 text-lg font-semibold text-gray-900">
				Confirm {showArchiveConfirm.archived ? 'Archive' : 'Unarchive'}
			</h3>
			<p class="mb-6 text-sm text-gray-600">
				{showArchiveConfirm.archived
					? 'This form will be archived and hidden from the main list. You can unarchive it later.'
					: 'This form will be restored and visible in the main list.'}
			</p>
			<div class="flex justify-end gap-3">
				<button type="button" class="btn-red px-4 py-2" onclick={() => (showArchiveConfirm = null)}>
					Cancel
				</button>
				<button type="submit" class="btn-blue px-4 py-2">
					{showArchiveConfirm.archived ? 'Archive' : 'Unarchive'}
				</button>
			</div>
		</form>
	</div>
{/if}
