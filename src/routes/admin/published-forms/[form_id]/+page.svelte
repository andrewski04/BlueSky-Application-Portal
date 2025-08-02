<script lang="ts">
	import type { PageProps } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import Tooltip from '$lib/components/util/Tooltip.svelte';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';
	import { enhance } from '$app/forms';

	let showDateRange = $state(false);
	let showGroup = $state(false);
	let activeTab = $state('assign'); // 'assign', 'manage'
	let editingGroup = $state<{ id: string; name: string; description: string } | null>(null);
	let newGroup = $state({ name: '', description: '' });

	// Date range validation state
	let dateRangeError = $state('');

	let { data, form }: PageProps = $props();
	let { applicationForm: initialApplicationForm, user, groups } = data;

	// Local state for application form to apply changes immediately
	let applicationForm = $state(initialApplicationForm);

	// Date range checkbox states
	let noOpenDate = $state(!applicationForm?.openDate);
	let noCloseDate = $state(!applicationForm?.closeDate);

	// Local state for groups to apply changes immediately
	let localGroups = $state(groups ? [...groups] : []);

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
		validateDateRange(value, (document.getElementById('closeDate') as HTMLInputElement)?.value);
	}

	function handleCloseDateChange(value: string) {
		if (value) {
			noCloseDate = false;
		}
		validateDateRange((document.getElementById('openDate') as HTMLInputElement)?.value, value);
	}

	// Clear input values when checkboxes are checked
	$effect(() => {
		if (noOpenDate) {
			const openDateInput = document.getElementById('openDate') as HTMLInputElement;
			if (openDateInput) {
				openDateInput.value = '';
			}
		}
	});

	$effect(() => {
		if (noCloseDate) {
			const closeDateInput = document.getElementById('closeDate') as HTMLInputElement;
			if (closeDateInput) {
				closeDateInput.value = '';
			}
		}
	});

	function handleEditGroup(group: any) {
		editingGroup = { id: group.id, name: group.name, description: group.description || '' };
		activeTab = 'manage';
	}

	// Update local groups when server data changes
	$effect(() => {
		if (groups) {
			localGroups = [...groups];
		}
	});

	// Update checkbox states when applicationForm changes
	$effect(() => {
		noOpenDate = !applicationForm?.openDate;
		noCloseDate = !applicationForm?.closeDate;
	});
</script>

<svelte:head>
	<title>Published Form Details</title>
</svelte:head>

{#if applicationForm}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Published Form: ${applicationForm?.name}`} />
		<div class="container mx-auto p-6">
			<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center justify-between">
					<h1 class="text-3xl font-bold">Published Form: {applicationForm?.name}</h1>
					<a href="/admin/published-forms" class="btn btn-danger px-3 py-1">Back</a>
				</div>

				<p><b>Description:</b> {applicationForm.description || 'No description provided'}</p>
				<p><b>ID:</b> {applicationForm.id}</p>
				<p>
					<b>Published At:</b>
					{applicationForm.publishedAt.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
				</p>
				<p><b>Active:</b> {applicationForm.active ? 'Yes' : 'No'}</p>
				{#if applicationForm.openDate || applicationForm.closeDate}
					<p>
						<b>Date Range:</b>
						{applicationForm.openDate?.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })} -
						{applicationForm.closeDate?.toLocaleString('en-US', { timeZoneName: 'shortGeneric' })}
					</p>
				{:else}
					<p><b>Date Range:</b> No date range</p>
				{/if}
				<p>
					<b>Draft Responses:</b>
					{applicationForm.responses.filter((r) => r.status === 'DRAFT').length}
				</p>
				<p>
					<b>Submitted Responses:</b>
					{applicationForm.responses.filter((r) => r.status !== 'DRAFT').length}
				</p>
				<p>
					<b>Group:</b>
					{applicationForm.group?.name || 'No group'}
				</p>

				<div class="mt-4 flex items-center gap-2">
					{#if applicationForm?.active}
						<form action="?/disablePublishedForm" method="post">
							<button
								type="submit"
								class="rounded-xl bg-red-600 px-4 py-1 text-white hover:bg-red-700"
							>
								Disable
							</button>
						</form>
					{:else}
						<form action="?/enablePublishedForm" method="post">
							<button
								type="submit"
								class="rounded-xl bg-green-600 px-4 py-1 text-white hover:bg-green-700"
							>
								Enable
							</button>
						</form>
					{/if}

					<button
						class="rounded-xl bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
						onclick={() => (showDateRange = true)}
					>
						Date Range
					</button>

					<button
						class="rounded-xl bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
						onclick={() => (showGroup = true)}
					>
						Group
					</button>
				</div>

				{#if form?.error}
					<p class="text-center font-bold text-red-700">Error: {form.error}</p>
				{/if}
			</div>

			<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				{#if applicationForm.sections.length == 0}
					<p class="text-center font-bold text-red-600">
						This form currently has no sections or questions.
					</p>
				{/if}

				{#each applicationForm.sections as section}
					<p class="mb-1 text-2xl font-bold">{section.name}</p>
					<p class="text-md">
						{section.description ? section.description : 'No description provided'}
					</p>
					{#each section.questions as question}
						{#if question.questionVersion}
							<p class="mt-4 font-bold">
								{question.questionVersion.prompt}
								<Tooltip tip="Required" top>
									<span class="text-red-600">{question.required ? '*' : ''}</span>
								</Tooltip>
							</p>
							<Tooltip
								tip="Library questions cannot be edited directly within a form. See Question Library page for more information."
								right
							>
								<p class="text-sm text-gray-700">Library Question ⓘ</p>
							</Tooltip>
							<p class="text-sm">
								{QuestionTypeMap[question.questionVersion.type]}
							</p>

							{#if question.questionVersion.options.length > 0}
								<p class="mt-2 text-sm font-bold underline">Options</p>
								{#each question.questionVersion.options as option}
									<p class="text-sm">{option.text}</p>
								{/each}
							{/if}
						{/if}
					{/each}
					<hr class="my-6 text-gray-400" />
				{/each}
			</div>

			{#if showGroup && groups}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div class="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-2xl">
						<div class="mb-4 flex items-center justify-between">
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

						<!-- Tab Navigation -->
						<div class="mb-6 border-b border-gray-200">
							<nav class="-mb-px flex space-x-8">
								<button
									class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'assign'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
									onclick={() => (activeTab = 'assign')}
								>
									Assign Group
								</button>
								<button
									class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'manage'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
									onclick={() => (activeTab = 'manage')}
								>
									Manage Groups
								</button>
							</nav>
						</div>

						<!-- Assign Group Tab -->
						{#if activeTab === 'assign'}
							<form class="flex flex-col gap-6" method="POST" action="?/updateFormGroup">
								<div class="form-group flex flex-col gap-2">
									<p class=" text-gray-700">
										When a user submits a form, the submissions will be added to the selected group. <br
										/>
										This allows you to organize submissions between forms.
									</p>
									<label for="group" class="font-semibold">Group</label>
									<select
										id="group"
										name="group"
										class="form-control rounded border-1 border-blue-500 bg-gray-200 px-4 py-2 text-lg text-black focus:ring-2 focus:ring-blue-300 focus:outline-none"
									>
										<option value="">No group</option>
										{#each localGroups as group}
											<option value={group.id} selected={applicationForm?.group?.id === group.id}>
												{group.name} ({group.formCount} forms)
											</option>
										{/each}
									</select>
								</div>
								<div class="mt-2 flex justify-end gap-4">
									<button
										type="button"
										class="btn btn-danger rounded-xl px-3 py-1"
										onclick={() => {
											showGroup = false;
											resetGroupForms();
										}}
									>
										Cancel
									</button>
									<button type="submit" class="btn btn-primary rounded-xl px-3 py-1">Save</button>
								</div>
							</form>
						{/if}

						<!-- Manage Groups Tab -->
						{#if activeTab === 'manage'}
							<div class="space-y-6">
								<!-- Create New Group -->
								<div class="rounded-lg border border-gray-200 p-4">
									<h3 class="mb-3 text-lg font-semibold">Create New Group</h3>
									<form
										class="flex flex-col gap-4"
										method="POST"
										action="?/createGroup"
										use:enhance={({ formData }) => {
											return async ({ result }) => {
												if (result.type === 'success') {
													// Add new group to local state immediately
													const name = formData.get('name') as string;
													const description = formData.get('description') as string;
													const newGroupData = {
														id: `temp-${Date.now()}`, // Temporary ID until server responds
														name,
														description,
														formCount: 0,
														forms: []
													};
													localGroups = [...localGroups, newGroupData];

													// Reset form
													newGroup.name = '';
													newGroup.description = '';
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
											<button type="submit" class="btn btn-primary rounded-xl px-4 py-2"
												>Create Group</button
											>
										</div>
									</form>
								</div>

								<!-- Edit Existing Group -->
								{#if editingGroup}
									<div class="rounded-lg border border-gray-200 p-4">
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
													<label for="editGroupDescription" class="font-semibold">Description</label
													>
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
													class="btn btn-secondary rounded-xl px-4 py-2"
													onclick={() => (editingGroup = null)}
												>
													Cancel
												</button>
												<button type="submit" class="btn btn-primary rounded-xl px-4 py-2"
													>Update Group</button
												>
											</div>
										</form>
									</div>
								{/if}

								<!-- Existing Groups List -->
								<div class="rounded-lg border border-gray-200 p-4">
									<h3 class="mb-3 text-lg font-semibold">Existing Groups</h3>
									{#if localGroups.length === 0}
										<p class="text-gray-500">No groups created yet.</p>
									{:else}
										<div class="space-y-3">
											{#each localGroups as group}
												<div
													class="flex items-center justify-between rounded border border-gray-200 p-3"
												>
													<div class="flex-1">
														<h4 class="font-semibold">{group.name}</h4>
														{#if group.description}
															<p class="text-sm text-gray-600">{group.description}</p>
														{/if}
														<p class="text-xs text-gray-500">{group.formCount} forms assigned</p>
													</div>
													<div class="flex gap-2">
														<button
															type="button"
															class="btn btn-secondary rounded px-2 py-1 text-sm"
															onclick={() => handleEditGroup(group)}
														>
															Edit
														</button>
														<form
															method="POST"
															action="?/deleteGroup"
															style="display: inline;"
															use:enhance={({ formData }) => {
																return async ({ result }) => {
																	if (result.type === 'success') {
																		// Remove from local state after successful server response
																		const groupId = formData.get('groupId') as string;
																		localGroups = localGroups.filter((g) => g.id !== groupId);

																		// If the current form was in this group, clear it
																		if (applicationForm?.group?.id === groupId) {
																			applicationForm.group = null;
																		}
																	}
																};
															}}
														>
															<input type="hidden" name="groupId" value={group.id} />
															<button
																type="submit"
																class="btn btn-danger rounded px-2 py-1 text-sm"
																disabled={group.formCount > 0}
																onclick={(e) => {
																	if (
																		!confirm(
																			'Are you sure you want to delete this group? This action cannot be undone.'
																		)
																	) {
																		e.preventDefault();
																	}
																}}
															>
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
						{/if}
					</div>
				</div>
			{/if}

			{#if showDateRange}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div class="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
						<h2 class="mb-2 text-center text-2xl font-bold">Edit Date Range</h2>
						<p class="text-center text-sm text-gray-500">
							If enabled, the form will be available between the selected dates.
						</p>
						<form
							class="flex flex-col gap-6"
							method="POST"
							action="?/updateFormDateRange"
							onsubmit={(e) => {
								const formData = new FormData(e.currentTarget);
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
									e.preventDefault();
									return false;
								}
							}}
							use:enhance={({ formData }) => {
								return async ({ result }) => {
									if (result.type === 'success') {
										// Update local state with the server response data
										// This ensures we have the correct UTC dates without double conversion
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
									}
								};
							}}
						>
							<input type="hidden" name="timezoneOffset" value={new Date().getTimezoneOffset()} />
							<input type="hidden" name="noOpenDate" value={noOpenDate ? 'true' : 'false'} />
							<input type="hidden" name="noCloseDate" value={noCloseDate ? 'true' : 'false'} />
							<div class="form-group flex flex-col gap-2">
								<label for="openDate" class="font-semibold">Open Date</label>
								<input
									type="datetime-local"
									id="openDate"
									name="openDate"
									disabled={noOpenDate}
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
									disabled={noCloseDate}
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
									class="btn btn-danger rounded-xl px-3 py-1"
									onclick={() => (showDateRange = false)}
								>
									Cancel
								</button>
								<button type="submit" class="btn btn-primary rounded-xl px-3 py-1">Save</button>
							</div>
						</form>
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="bg-secondary min-h-screen">
		<AdminNavBar message={`Viewing Form: Form Not Found`} />
		<div class="container mx-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Form Details</h1>
				<a href="/admin/forms" class="btn btn-danger px-3 py-1">Back</a>
			</div>
			<div
				class="mb-6 rounded-md border border-gray-200 bg-white p-6 text-center text-red-500 shadow-sm"
			>
				<p><b>Error retrieving form details</b></p>
			</div>
		</div>
	</div>
{/if}
