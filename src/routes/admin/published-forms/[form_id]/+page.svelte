<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import { getColorSchemeClassName } from '$lib/utils/colorScheme';
	import { enhance } from '$app/forms';
	import { addNotif } from '$lib/utils/notify';
	import DraftQuestionOverview from '$lib/components/form/DraftQuestionOverview.svelte';
	import { confirm } from '$lib/utils/confirmModal';

	let showDateRange = $state(false);
	let showGroup = $state(false);
	let editingGroup = $state<{ id: string; name: string; description: string } | null>(null);
	let newGroup = $state({ name: '', description: '' });

	// Date range validation state
	let dateRangeError = $state('');

	let { data, form }: PageProps = $props();
	let { applicationForm: initialApplicationForm, user, groups } = data;

	// Local state for application form to apply changes immediately
	let applicationForm = $state(initialApplicationForm);
	let editFormPopup = $state(false);
	let name = $state(applicationForm?.name || '');
	let description = $state(applicationForm?.description || '');
	let adminName = $state(applicationForm?.adminName || '');

	// Date range checkbox states
	let noOpenDate = $state(!applicationForm?.openDate);
	let noCloseDate = $state(!applicationForm?.closeDate);
	let openDateInput = $state<HTMLInputElement | null>(null);
	let closeDateInput = $state<HTMLInputElement | null>(null);

	// Local state for groups to apply changes immediately
	let localGroups = $state(groups || []);
	let groupSearchQuery = $state('');

	let filteredGroups = $derived(
		localGroups.filter(
			(group) =>
				group.name.toLowerCase().includes(groupSearchQuery.toLowerCase().trim()) ||
				group.description?.toLowerCase().includes(groupSearchQuery.toLowerCase().trim())
		)
	);

	function resetGroupForms() {
		editingGroup = null;
		newGroup = { name: '', description: '' };
	}

	function validateDateRange(openDate: string | null, closeDate: string | null): boolean {
		if (!openDate || !closeDate) return true; // Allow empty dates

		const open = new Date(openDate);
		const close = new Date(closeDate);

		if (open >= close) {
			dateRangeError = 'Open date must be before close date';
			return false;
		}

		dateRangeError = '';
		return true;
	}

	function handleOpenDateChange(value: string) {
		if (value) {
			noOpenDate = false;
		}
		validateDateRange(value, closeDateInput?.value || null);
	}

	function handleCloseDateChange(value: string) {
		if (value) {
			noCloseDate = false;
		}
		validateDateRange(openDateInput?.value || null, value);
	}

	function currentDate(hour: number = 0, minute: number = 0, now: Date = new Date()) {
		const timezoneOffset = now.getTimezoneOffset();
		now.setMinutes(now.getMinutes() - timezoneOffset);
		hour = hour - timezoneOffset / 60;
		now.setHours(hour, minute, 0, 0);
		return now.toISOString().slice(0, 16);
	}

	// Functions to handle checkbox changes
	function handleNoOpenDateChange() {
		if (noOpenDate) {
			if (openDateInput) {
				openDateInput.value = '';
			}
		} else {
			if (openDateInput) {
				openDateInput.value = applicationForm?.openDate
					? new Date(
							applicationForm.openDate.getTime() -
								applicationForm.openDate.getTimezoneOffset() * 60000
						)
							.toISOString()
							.slice(0, 16)
					: currentDate(0, 0);
			}
		}
	}

	function handleNoCloseDateChange() {
		if (noCloseDate) {
			if (closeDateInput) {
				closeDateInput.value = '';
			}
		} else {
			if (closeDateInput) {
				closeDateInput.value = applicationForm?.closeDate
					? new Date(
							applicationForm.closeDate.getTime() -
								applicationForm.closeDate.getTimezoneOffset() * 60000
						)
							.toISOString()
							.slice(0, 16)
					: currentDate(23, 59);
			}
		}
	}

	function handleEditGroup(group: any) {
		editingGroup = { id: group.id, name: group.name, description: group.description || '' };
	}

	// Functions to update state when needed
	function updateLocalGroups() {
		if (localGroups) {
			localGroups = localGroups;
		}
	}

	function updateCheckboxStates() {
		noOpenDate = !applicationForm?.openDate;
		noCloseDate = !applicationForm?.closeDate;
	}

	// Initialize state when component loads
	updateLocalGroups();
	updateCheckboxStates();

	const notypecheck = (x: any) => x;
</script>

<svelte:head>
	<title>Published Form Details</title>
	<style>
		.main-container {
			background: linear-gradient(
				180deg,
				rgba(239, 246, 255, 0.5) 0%,
				rgba(219, 234, 254, 0.3) 50%,
				rgba(147, 197, 253, 0.1) 100%
			);
		}
		.content-card {
			background: linear-gradient(
				135deg,
				rgba(255, 255, 255, 0.95) 0%,
				rgba(248, 250, 252, 0.9) 100%
			);
			box-shadow:
				0 8px 32px rgba(59, 130, 246, 0.1),
				0 4px 16px rgba(0, 0, 0, 0.05);
			border: 1px solid rgba(59, 130, 246, 0.1);
			backdrop-filter: blur(10px);
			border-radius: 16px;
			transition: all 0.3s ease;
		}

		.content-card:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.15),
				0 6px 20px rgba(0, 0, 0, 0.08);
			transform: translateY(-2px);
		}

		.section-header {
			background: linear-gradient(
				135deg,
				rgba(59, 130, 246, 0.05) 0%,
				rgba(147, 197, 253, 0.05) 100%
			);
			border-bottom: 1px solid rgba(59, 130, 246, 0.1);
			border-radius: 16px 16px 0 0;
		}
	</style>
</svelte:head>

{#if applicationForm}
	<div class="main-container min-h-screen">
		<AdminNavBar message={`Viewing Published Form: ${applicationForm?.name}`} />
		<div class="content-card container mx-auto mt-8 p-6">
			<div class="section-header rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<!-- Header with title and back button -->
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<h1 class="text-3xl font-bold text-gray-800">
							<span class="rounded-lg bg-blue-300 px-2 py-1 text-blue-800">Published</span>

							{#if applicationForm?.archived}
								<span class="rounded-lg bg-amber-300 px-2 py-1 text-amber-800">Archived</span>
							{:else}
								<span
									class="rounded-lg px-2 py-1 {applicationForm.active
										? 'bg-green-300 text-green-800'
										: 'bg-red-300 text-red-800'}"
								>
									{applicationForm.active ? 'Active' : 'Inactive'}
								</span>
							{/if}
							{name}
						</h1>
						{#if !applicationForm?.archived}
							<button
								class="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
								aria-label="Edit published form"
								onclick={() => {
									editFormPopup = true;
									updateCheckboxStates();
								}}
							>
								<img src="/icons/edit.svg" alt="Edit" class="h-5 w-5" />
							</button>
						{/if}
					</div>
					<button onclick={() => history.back()} class="btn-red px-4 py-2">Back</button>
				</div>

				<!-- Description -->
				<div class="mb-6">
					<p class="text-lg leading-relaxed text-gray-700">
						{description || 'No description provided'}
					</p>
				</div>

				<!-- Metadata Grid -->
				<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Form ID
						</h3>
						<p class="font-mono text-sm text-gray-800">{applicationForm.id}</p>
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Admin Name
						</h3>
						<p class="text-sm text-gray-800">
							{applicationForm.adminName || 'No admin name set'}
						</p>
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Published
						</h3>
						<p class="text-sm text-gray-800">
							{applicationForm.publishedAt.toLocaleString('en-US', {
								timeZoneName: 'shortGeneric'
							})}
						</p>
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Date Range
						</h3>
						{#if applicationForm.openDate || applicationForm.closeDate}
							<div class="space-y-1">
								<p class=" text-sm text-gray-800">
									<span class="font-semibold">Open:</span>
									{applicationForm.openDate
										? applicationForm.openDate.toLocaleString('en-US', {
												timeZoneName: 'shortGeneric'
											})
										: 'No open date set'}
								</p>
								<p class=" text-sm text-gray-800">
									<span class="font-semibold">Close:</span>
									{applicationForm.closeDate
										? applicationForm.closeDate.toLocaleString('en-US', {
												timeZoneName: 'shortGeneric'
											})
										: 'No close date set'}
								</p>
							</div>
						{:else}
							<p class="text-sm text-gray-500">No date range set</p>
						{/if}
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Responses
						</h3>
						<div class="space-y-1">
							<p class="text-sm text-gray-800">
								<span class="font-medium"
									>{applicationForm.responses.filter((r) => r.status === 'DRAFT').length}</span
								> drafts
							</p>
							<p class="text-sm text-gray-800">
								<span class="font-medium"
									>{applicationForm.responses.filter((r) => r.status !== 'DRAFT').length}</span
								> submitted
							</p>
						</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">Group</h3>
						<p class="text-sm text-gray-800">
							{applicationForm.group?.name || 'No group assigned'}
						</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex items-center gap-3">
					<!-- Active Form Button -->
					{#if !applicationForm?.archived}
						<form
							action="?/updatePublishedFormActiveStatus"
							method="post"
							class="inline"
							use:enhance={async ({ cancel }) => {
								if (
									!(await confirm(
										`Are you sure you want to ${applicationForm?.active ? 'disable' : 'enable'} this form? ${applicationForm?.active ? 'The form will not be accessible to users.' : 'The form will be active and accessible to users, if within the date range.'}`,
										'Confirm',
										'Cancel',
										'Confirm Form Activation'
									))
								) {
									cancel();
								}
								return async ({ result }) => {
									if (result.type === 'success') {
										addNotif(`Form ${applicationForm?.active ? 'disabled' : 'enabled'}`, 'success');
										applicationForm.active = !applicationForm.active;
									} else if (result.type === 'failure') {
										addNotif(
											`Failed to ${applicationForm?.active ? 'disable' : 'enable'} form: ${result.data?.error || 'Unknown error'} `,
											'error'
										);
									}
								};
							}}
						>
							<input
								type="hidden"
								name="action"
								value={applicationForm?.active ? 'disable' : 'enable'}
							/>
							<button
								type="submit"
								class="{applicationForm?.active ? 'btn-red' : 'btn-green'} px-6 py-2 text-lg"
							>
								{applicationForm?.active ? 'Disable' : 'Enable'} Form
							</button>
						</form>
					{/if}

					<!-- Archive Form Button -->
					<form
						action="?/updatePublishedFormArchiveStatus"
						method="post"
						class="inline"
						use:enhance={async ({ cancel }) => {
							if (
								!(await confirm(
									`Are you sure you want to ${applicationForm?.archived ? 'unarchive' : 'archive'} this form? ${applicationForm?.archived ? '' : 'This will disable the form and it will not be accessible to users.'}`
								))
							) {
								cancel();
							}
							return async ({ result }) => {
								if (result.type === 'success') {
									addNotif(
										`Form ${applicationForm?.archived ? 'unarchived' : 'archived'}`,
										'success'
									);
									applicationForm.archived = !applicationForm.archived;
									applicationForm.active = false;
								} else if (result.type === 'failure') {
									addNotif(
										`Failed to ${applicationForm?.archived ? 'unarchive' : 'archive'} form: ${result.data?.error || 'Unknown error'} `,
										'error'
									);
								}
							};
						}}
					>
						<input
							type="hidden"
							name="action"
							value={applicationForm?.archived ? 'unarchive' : 'archive'}
						/>
						<button
							type="submit"
							class="{applicationForm?.archived ? 'btn-green' : 'btn-yellow'} px-6 py-2 text-lg"
						>
							{applicationForm?.archived ? 'Unarchive' : 'Archive'} Form
						</button>
					</form>

					{#if !applicationForm?.archived}
						<button
							class="btn-blue px-6 py-2 text-lg"
							onclick={() => {
								showDateRange = true;
								updateCheckboxStates();
							}}
						>
							Edit Date Range
						</button>

						<button
							class="btn-blue px-6 py-2 text-lg"
							onclick={() => {
								showGroup = true;
								updateLocalGroups();
							}}
						>
							Edit Group
						</button>
					{/if}
				</div>

				{#if form?.error}
					<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
						<p class="font-medium text-red-700">Error: {form.error}</p>
					</div>
				{/if}
			</div>

			<div class="rounded-b-lg border border-gray-200 bg-white p-6 shadow-sm">
				{#if applicationForm.sections.length == 0}
					<p class="text-center font-bold text-red-600">
						This form currently has no sections or questions.
					</p>
				{/if}

				{#each applicationForm.sections as section}
					<div class="{getColorSchemeClassName(section.colorScheme)} mb-2 rounded-lg p-4">
						<h2 class="text-2xl font-bold text-white">
							Section {section.displayOrder + 1}:
							{section.name}
						</h2>
						{#if section.description}
							<p class="text-white">{section.description}</p>
						{/if}
					</div>
					<div class="mt-4">
						{#each section.questions as question}
							<div class="mb-4">
								<DraftQuestionOverview
									question={notypecheck(question)}
									hideLibrary
									hideDragHandle
								/>
							</div>
						{/each}
					</div>
					<hr class="my-6 text-gray-300" />
				{/each}
			</div>
		</div>
	</div>
{:else}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Form: Form Not Found`} />
		<div class="container mx-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Form Details</h1>
				<button onclick={() => history.back()} class="btn-red px-3 py-1">Back</button>
			</div>
			<div
				class="mb-6 rounded-md border border-gray-200 bg-white p-6 text-center text-red-500 shadow-sm"
			>
				<p><b>Error retrieving form details</b></p>
			</div>
		</div>
	</div>
{/if}

{#if editFormPopup}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				editFormPopup = false;
			}
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				editFormPopup = false;
			}
		}}
		tabindex="-1"
	>
		<div class="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
			<h2 class="mb-2 text-center text-2xl font-bold">Edit Published Form</h2>
			<form
				class="flex flex-col gap-6"
				method="POST"
				action="?/updatePublishedForm"
				use:enhance={(formData) => {
					const newName = formData.formData.get('name');
					const newDescription = formData.formData.get('description');
					const newAdminName = formData.formData.get('adminName');
					return async ({ result }) => {
						if (result.type === 'success') {
							editFormPopup = false;
							name = newName as string;
							description = (newDescription as string) || '';
							adminName = (newAdminName as string) || '';
							// Update the applicationForm object so the UI reflects the changes immediately
							if (applicationForm) {
								applicationForm.name = newName as string;
								applicationForm.description = (newDescription as string) || '';
								applicationForm.adminName = (newAdminName as string) || '';
							}
							addNotif(result.data?.message as string, 'success');
						} else if (result.type === 'failure') {
							addNotif(result.data?.error as string, 'error');
						}
					};
				}}
			>
				<div class="form-group flex flex-col gap-2">
					<label for="name" class="font-semibold"
						>Display Name<span class="text-red-600">*</span></label
					>
					<input
						type="text"
						id="name"
						name="name"
						class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
						value={name}
						required
					/>
				</div>
				<div class="form-group flex flex-col gap-2">
					<label for="adminName" class="font-semibold">Admin Name</label>
					<p class="text-sm text-gray-500">
						Optional for sorting forms. This will not be displayed to students.
					</p>
					<input
						type="text"
						id="adminName"
						name="adminName"
						class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
						value={adminName}
						placeholder="Admin-only name for sorting forms"
					/>
				</div>
				<div class="description flex flex-col gap-2">
					<label for="description" class="font-semibold">Description</label>
					<textarea
						id="description"
						name="description"
						class="form-control min-h-[100px] resize-y rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
						value={description}
					></textarea>
				</div>
				<div class="mt-2 flex justify-end gap-4">
					<button
						type="button"
						class="btn-red rounded-xl px-3 py-1"
						onclick={() => {
							editFormPopup = false;
						}}
					>
						Cancel
					</button>
					<button type="submit" class="btn-blue rounded-xl px-3 py-1">Save</button>
				</div>
			</form>
		</div>
	</div>
{/if}
<!-- Date Range Modal -->
{#if showDateRange && applicationForm}
	<div
		class="body-overflow-hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				showDateRange = false;
				noOpenDate = applicationForm?.openDate ? false : true;
				noCloseDate = applicationForm?.closeDate ? false : true;
			}
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				showDateRange = false;
				noOpenDate = applicationForm?.openDate ? false : true;
				noCloseDate = applicationForm?.closeDate ? false : true;
			}
		}}
		tabindex="-1"
	>
		<div class="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
			<h2 class="mb-2 text-center text-2xl font-bold">Edit Date Range</h2>
			<p class="mb-2 text-center text-sm text-gray-500">
				The form will be available between the selected dates.
				<br />
				Note: The form must still be enabled to be visible.
			</p>
			<form
				class="flex flex-col gap-6"
				method="POST"
				action="?/updateFormDateRange"
				use:enhance={({ formData, cancel }) => {
					let openDate = formData.get('openDate') as string | null;
					let closeDate = formData.get('closeDate') as string | null;

					// If checkbox is checked, set date to null
					if (noOpenDate) {
						openDate = null;
					}
					if (noCloseDate) {
						closeDate = null;
					}

					if (!validateDateRange(openDate, closeDate)) {
						cancel();
					}

					formData.set(
						'openDatetimezoneOffset',
						new Date(openDate || '').getTimezoneOffset().toString()
					);
					formData.set(
						'closeDatetimezoneOffset',
						new Date(closeDate || '').getTimezoneOffset().toString()
					);

					return async ({ result }) => {
						if (result.type === 'success') {
							const responseData = result.data as
								| { openDate?: string; closeDate?: string }
								| undefined;

							if (responseData?.openDate) {
								applicationForm.openDate = new Date(responseData.openDate);
								noOpenDate = false;
							} else {
								applicationForm.openDate = null;
								noOpenDate = true;
							}

							if (responseData?.closeDate) {
								applicationForm.closeDate = new Date(responseData.closeDate);
								noCloseDate = false;
							} else {
								applicationForm.closeDate = null;
								noCloseDate = true;
							}

							// Close modal on success
							showDateRange = false;
							addNotif('Date range updated successfully', 'success');
						} else if (result.type === 'failure') {
							addNotif(result.data?.error as string, 'error');
						}
					};
				}}
			>
				<input type="hidden" name="noOpenDate" value={noOpenDate ? 'true' : 'false'} />
				<input type="hidden" name="noCloseDate" value={noCloseDate ? 'true' : 'false'} />
				<div class="form-group flex flex-col gap-2">
					<label for="openDate" class="font-semibold">Open Date</label>
					<input
						type="datetime-local"
						id="openDate"
						name="openDate"
						bind:this={openDateInput}
						disabled={noOpenDate}
						max="9999-12-31T23:59"
						class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
						value={applicationForm?.openDate
							? new Date(
									applicationForm.openDate.getTime() -
										applicationForm.openDate.getTimezoneOffset() * 60000
								)
									.toISOString()
									.slice(0, 16)
							: ''}
						oninput={(e) => {
							const openDate = e.currentTarget.value;
							handleOpenDateChange(openDate);
						}}
					/>
					<div class="mb-2 flex items-center gap-2">
						<input
							type="checkbox"
							id="noOpenDate"
							bind:checked={noOpenDate}
							class="rounded border-gray-300"
							onclick={() => {
								noOpenDate = !noOpenDate;
								handleNoOpenDateChange();
							}}
						/>
						<label for="noOpenDate" class="font-semibold">No Open Date</label>
					</div>
				</div>
				<div class="form-group flex flex-col gap-2">
					<label for="closeDate" class="font-semibold">Close Date</label>
					<input
						type="datetime-local"
						id="closeDate"
						name="closeDate"
						bind:this={closeDateInput}
						disabled={noCloseDate}
						max="9999-12-31T23:59"
						class="form-control rounded border-1 border-blue-500 px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
						value={applicationForm?.closeDate
							? new Date(
									applicationForm.closeDate.getTime() -
										applicationForm.closeDate.getTimezoneOffset() * 60000
								)
									.toISOString()
									.slice(0, 16)
							: ''}
						oninput={(e) => {
							const closeDate = e.currentTarget.value;
							handleCloseDateChange(closeDate);
						}}
					/>
					<div class="mb-2 flex items-center gap-2">
						<input
							type="checkbox"
							id="noCloseDate"
							bind:checked={noCloseDate}
							class="rounded border-gray-300"
							onclick={() => {
								noCloseDate = !noCloseDate;
								handleNoCloseDateChange();
							}}
						/>
						<label for="noCloseDate" class="font-semibold">No Close Date</label>
					</div>
				</div>

				{#if dateRangeError}
					<div class="text-sm font-medium text-red-600">{dateRangeError}</div>
				{/if}
				<div class="mt-2 flex justify-end gap-4">
					<button
						type="button"
						class="btn-red rounded-xl px-3 py-1"
						onclick={() => {
							showDateRange = false;
							noOpenDate = !applicationForm?.openDate;
							noCloseDate = !applicationForm?.closeDate;
						}}
					>
						Cancel
					</button>
					<button type="submit" class="btn-blue rounded-xl px-3 py-1">Save</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Group Modal -->
{#if showGroup && groups}
	<div
		class="body-overflow-hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				showGroup = false;
				resetGroupForms();
			}
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				showGroup = false;
				resetGroupForms();
			}
		}}
		tabindex="-1"
	>
		<div
			class="relative flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-white p-6 shadow-2xl"
		>
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-2xl font-bold">Group Management</h2>
				<button
					type="button"
					class="text-gray-500 hover:text-gray-700"
					onclick={() => {
						showGroup = false;
						resetGroupForms();
					}}
				>
					✕
				</button>
			</div>
			<p class="mb-4 text-sm text-gray-500">
				ⓘ Groups are used to organize submissions. If the form's group is changed, any submitted
				responses will stay in the old group.
			</p>

			<div class="flex min-h-0 flex-1 flex-col space-y-6">
				<!-- Create New Group -->
				{#if !editingGroup}
					<div class="flex-shrink-0 rounded-lg border border-gray-200 p-4">
						<h3 class="mb-3 text-lg font-semibold">Create New Group</h3>
						<form
							class="flex flex-col gap-4"
							method="POST"
							action="?/createGroup"
							use:enhance={({ formData }) => {
								return async ({ result }) => {
									if (result.type === 'success') {
										// Add new group to local state with real ID from server
										const groupData = (result.data as any)?.group;
										if (groupData) {
											const newGroupData = {
												id: groupData.id,
												name: groupData.name,
												description: groupData.description,
												_count: groupData._count
											};
											localGroups = [...localGroups, newGroupData];
										}

										// Reset form
										newGroup.name = '';
										newGroup.description = '';
										updateLocalGroups();
										addNotif('Group created successfully', 'success');
									} else if (result.type === 'failure') {
										addNotif(result.data?.error as string, 'error');
									}
								};
							}}
						>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="flex flex-col gap-2">
									<label for="newGroupName" class="font-semibold">Name (required)</label>
									<input
										type="text"
										id="newGroupName"
										name="name"
										bind:value={newGroup.name}
										class="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
										required
									/>
								</div>
								<div class="flex flex-col gap-2">
									<label for="newGroupDescription" class="font-semibold">Description</label>
									<input
										type="text"
										id="newGroupDescription"
										name="description"
										bind:value={newGroup.description}
										class="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
									/>
								</div>
							</div>
							<div class="flex justify-end">
								<button type="submit" class="btn-blue rounded-xl px-4 py-2">Create Group</button>
							</div>
						</form>
					</div>
				{/if}

				<!-- Edit Existing Group -->
				{#if editingGroup}
					<div class="flex-shrink-0 rounded-lg border border-gray-200 p-4">
						<h3 class="mb-3 text-lg font-semibold">Edit Group</h3>
						<form
							class="flex flex-col gap-4"
							method="POST"
							action="?/updateGroup"
							use:enhance={({ formData }) => {
								return async ({ result }) => {
									if (result.type === 'success') {
										// Update group in local state immediately
										const groupId = formData.get('groupId') as string;
										const name = formData.get('name') as string;
										const description = formData.get('description') as string;

										localGroups = localGroups.map((g) =>
											g.id === groupId ? { ...g, name, description } : g
										);

										// Clear editing state
										editingGroup = null;
										newGroup.name = '';
										newGroup.description = '';
										updateLocalGroups();
										addNotif('Group updated successfully', 'success');
									} else if (result.type === 'failure') {
										addNotif(result.data?.error as string, 'error');
									}
								};
							}}
						>
							<input type="hidden" name="groupId" value={editingGroup.id} />
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="flex flex-col gap-2">
									<label for="editGroupName" class="font-semibold">Name</label>
									<input
										type="text"
										id="editGroupName"
										name="name"
										bind:value={editingGroup.name}
										class="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
										required
									/>
								</div>
								<div class="flex flex-col gap-2">
									<label for="editGroupDescription" class="font-semibold">Description</label>
									<input
										type="text"
										id="editGroupDescription"
										name="description"
										bind:value={editingGroup.description}
										class="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
									/>
								</div>
							</div>
							<div class="flex justify-end gap-2">
								<button
									type="button"
									class="btn-red rounded-xl px-4 py-2"
									onclick={() => (editingGroup = null)}
								>
									Cancel
								</button>
								<button type="submit" class="btn-blue rounded-xl px-4 py-2">Update Group</button>
							</div>
						</form>
					</div>
				{/if}

				<!-- Existing Groups List -->
				<div
					class="min-h-0 flex-1 overflow-hidden overflow-y-auto rounded-lg border border-gray-200 p-4 pb-4"
				>
					<h3 class="mb-3 flex-shrink-0 text-lg font-semibold">Existing Groups</h3>
					{#if localGroups.length === 0}
						<p class="text-gray-500">No groups created yet.</p>
					{:else}
						<div class="mb-4 max-h-full">
							<input
								type="text"
								placeholder="Search groups"
								bind:value={groupSearchQuery}
								class="mb-3 w-full rounded border border-gray-200 p-2 lg:w-[50%]"
							/>
							{#if filteredGroups.length === 0}
								<p class="center text-gray-500">No groups found matching your search.</p>
							{/if}
							{#each filteredGroups as group}
								<div
									class="mb-3 flex items-center justify-between rounded border border-gray-200 p-3"
								>
									<div class="flex-1">
										<h4 class="font-semibold">{group.name}</h4>
										{#if group.description}
											<p class="text-sm text-gray-600">{group.description}</p>
										{/if}
										<p class="text-xs text-gray-500">
											{group._count.forms} forms assigned, {group._count.submissions} submissions
										</p>

										{#if applicationForm?.group?.id === group.id}
											<p class="text-xs font-medium text-green-600">
												✓ Current form is in this group
											</p>
										{/if}
									</div>
									<div class="flex gap-2">
										<button
											type="button"
											class="btn-blue rounded px-2 py-1 text-sm"
											onclick={() => handleEditGroup(group)}
										>
											Edit
										</button>
										{#if applicationForm?.group?.id !== group.id}
											<form
												method="POST"
												action="?/updateFormGroup"
												style="display: inline;"
												use:enhance={({ formData }) => {
													return async ({ result }) => {
														if (result.type === 'success' && applicationForm) {
															// Update local state to show the form is now in this group
															applicationForm.group = group;
															// Update form counts
															localGroups = localGroups.map((g) => {
																if (g.id === group.id) {
																	return {
																		...g,
																		_count: { ...g._count, forms: g._count.forms + 1 }
																	};
																}
																return g;
															});
															updateLocalGroups();
															addNotif('Form added to group successfully', 'success');
														} else if (result.type === 'failure') {
															addNotif(result.data?.error as string, 'error');
														}
													};
												}}
											>
												<input type="hidden" name="group" value={group.id} />
												<button type="submit" class="btn-green rounded px-2 py-1 text-sm">
													Add Form
												</button>
											</form>
										{:else}
											<form
												method="POST"
												action="?/updateFormGroup"
												style="display: inline;"
												use:enhance={({ formData }) => {
													return async ({ result }) => {
														if (result.type === 'success' && applicationForm) {
															// Remove form from group
															applicationForm.group = null;
															// Update form counts
															localGroups = localGroups.map((g) => {
																if (g.id === group.id) {
																	return {
																		...g,
																		_count: { ...g._count, forms: Math.max(0, g._count.forms - 1) }
																	};
																}
																return g;
															});
															updateLocalGroups();
															addNotif('Form removed from group successfully', 'success');
														} else if (result.type === 'failure') {
															addNotif(result.data?.error as string, 'error');
														}
													};
												}}
											>
												<input type="hidden" name="group" value="" />
												<button type="submit" class="btn-yellow rounded px-2 py-1 text-sm">
													Remove
												</button>
											</form>
										{/if}
										<form
											method="POST"
											action="?/deleteGroup"
											style="display: inline;"
											use:enhance={async ({ formData, cancel }) => {
												if (
													!(await confirm(
														'Are you sure you want to delete this group? All forms and submissions in this group will be unassigned. This action cannot be undone.',
														'Delete',
														'Cancel',
														'Confirm Group Deletion'
													))
												) {
													cancel();
												}

												return async ({ result }) => {
													if (result.type === 'success' && applicationForm) {
														// Remove from local state after successful server response
														const groupId = formData.get('groupId') as string;
														localGroups = localGroups.filter((g) => g.id !== groupId);

														// If the current form was in this group, clear it
														if (applicationForm?.group?.id === groupId) {
															applicationForm.group = null;
														}
														updateLocalGroups();
														addNotif('Group deleted successfully', 'success');
													} else if (result.type === 'failure') {
														addNotif(result.data?.error as string, 'error');
													}
												};
											}}
										>
											<input type="hidden" name="groupId" value={group.id} />
											<button type="submit" class="btn-red rounded px-2 py-1 text-sm">
												Delete
											</button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
