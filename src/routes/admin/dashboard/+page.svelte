<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let {
		user,
		recentDraftForms,
		recentPublishedForms,
		recentSubmissions,
		recentAnnouncements,
		calendarEvents,
		submissionStats,
		totalDraftForms,
		totalPublishedForms,
		totalSubmissions,
		totalAnnouncements
	} = data;

	// Calendar state
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

	// Generate calendar days
	type CalendarDay = {
		day: number;
		isCurrentMonth: boolean;
		isToday?: boolean;
		events: typeof calendarEvents;
	};

	const calendarDays: CalendarDay[] = [];
	const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

	// Previous month days
	for (let i = firstDayOfMonth - 1; i >= 0; i--) {
		calendarDays.push({
			day: prevMonthDays - i,
			isCurrentMonth: false,
			events: []
		});
	}

	// Current month days
	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(currentYear, currentMonth, day);
		const events = calendarEvents.filter((event) => {
			const openDate = event.openDate ? new Date(event.openDate) : null;
			const closeDate = event.closeDate ? new Date(event.closeDate) : null;
			return (
				(openDate && openDate.toDateString() === date.toDateString()) ||
				(closeDate && closeDate.toDateString() === date.toDateString())
			);
		});

		calendarDays.push({
			day,
			isCurrentMonth: true,
			isToday: day === now.getDate(),
			events
		});
	}

	// Next month days to fill the grid
	const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
	for (let day = 1; day <= remainingDays; day++) {
		calendarDays.push({
			day,
			isCurrentMonth: false,
			events: []
		});
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDateTime(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'DRAFT':
				return 'bg-yellow-100 text-yellow-800';
			case 'SUBMITTED':
				return 'bg-blue-100 text-blue-800';
			case 'APPROVED':
				return 'bg-green-100 text-green-800';
			case 'REJECTED':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'DRAFT':
				return 'Draft';
			case 'SUBMITTED':
				return 'Submitted';
			case 'APPROVED':
				return 'Approved';
			case 'REJECTED':
				return 'Rejected';
			default:
				return status;
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div class="main-container min-h-screen">
	<AdminNavBar message={`Welcome, ${user.firstName}!`} />

	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="content-card mb-8">
			<div class=" p-6">
				<h2 class="flex items-center text-xl font-semibold text-gray-800">
					<svg
						class="mr-3 h-6 w-6 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						></path>
					</svg>
					Dashboard Overview
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					Monitor your application forms, submissions, and announcements
				</p>
			</div>
		</div>

		<!-- Statistics Cards -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<!-- Draft Forms -->
			<div class="content-card">
				<div class="p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
								<svg
									class="h-5 w-5 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Draft Forms</p>
							<p class="text-2xl font-semibold text-gray-900">{totalDraftForms}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Published Forms -->
			<div class="content-card">
				<div class="p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
								<svg
									class="h-5 w-5 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Published Forms</p>
							<p class="text-2xl font-semibold text-gray-900">{totalPublishedForms}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Total Submissions -->
			<div class="content-card">
				<div class="p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
								<svg
									class="h-5 w-5 text-purple-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Total Submissions</p>
							<p class="text-2xl font-semibold text-gray-900">{totalSubmissions}</p>
							<p class="text-xs text-gray-500">
								{(() => {
									const submitted =
										submissionStats.find((s) => s.status === 'SUBMITTED')?._count.status || 0;
									const draft =
										submissionStats.find((s) => s.status === 'DRAFT')?._count.status || 0;
									return `${submitted} submitted, ${draft} draft`;
								})()}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Announcements -->
			<div class="content-card">
				<div class="p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
								<svg
									class="h-5 w-5 text-orange-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Announcements</p>
							<p class="text-2xl font-semibold text-gray-900">{totalAnnouncements}</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Recent Submissions -->
				<div class="content-card">
					<div class="section-header p-6">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-800">Recent Submissions</h3>
							<button onclick={() => goto('/admin/submissions')} class="btn-blue px-4 py-2 text-sm">
								View All
							</button>
						</div>
					</div>
					<div class="p-6 pt-0">
						{#if recentSubmissions.length > 0}
							<div class="space-y-4">
								{#each recentSubmissions as submission}
									<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
										<div class="flex-1">
											<div class="flex items-center space-x-3">
												<div class="flex-shrink-0">
													<div
														class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300"
													>
														<span class="text-sm font-medium text-gray-700">
															{submission.user.firstName?.[0] || ''}{submission.user
																.lastName?.[0] || ''}
														</span>
													</div>
												</div>
												<div class="min-w-0 flex-1">
													<p class="truncate text-sm font-medium text-gray-900">
														{submission.user.firstName || ''}
														{submission.user.lastName || ''}
													</p>
													<p class="truncate text-sm text-gray-500">{submission.form.name}</p>
												</div>
											</div>
										</div>
										<div class="flex items-center space-x-4">
											<span
												class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
													submission.status
												)}"
											>
												{getStatusText(submission.status)}
											</span>
											<span class="text-sm text-gray-500">
												{formatDateTime(submission.updatedAt)}
											</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<svg
									class="mx-auto h-12 w-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									></path>
								</svg>
								<p class="mt-2 text-sm text-gray-500">No submissions yet</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Form Lists Side by Side -->
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<!-- Recent Draft Forms -->
					<div class="content-card">
						<div class="section-header p-6">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold text-gray-800">Recent Draft Forms</h3>
								<button
									onclick={() => goto('/admin/form-drafts')}
									class="btn-blue px-4 py-2 text-sm"
								>
									View All
								</button>
							</div>
						</div>
						<div class="p-6 pt-0">
							{#if recentDraftForms.length > 0}
								<div class="space-y-4">
									{#each recentDraftForms as form}
										<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
											<div class="min-w-0 flex-1">
												<h4 class="truncate text-sm font-medium text-gray-900">{form.name}</h4>
												{#if form.description}
													<p class="mt-1 truncate text-sm text-gray-500">{form.description}</p>
												{/if}
												<div class="mt-2 flex items-center space-x-4">
													<span class="text-xs text-gray-500">
														{form._count.sections} sections
													</span>
													<span class="text-xs text-gray-500">
														Updated {formatDate(form.updatedAt)}
													</span>
												</div>
											</div>
											<button
												onclick={() => goto(`/admin/form-drafts/${form.id}`)}
												class="btn-green ml-2 flex-shrink-0 px-4 py-2 text-xs"
											>
												Edit
											</button>
										</div>
									{/each}
								</div>
							{:else}
								<div class="py-8 text-center">
									<svg
										class="mx-auto h-12 w-12 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										></path>
									</svg>
									<p class="mt-2 text-sm text-gray-500">No draft forms yet</p>
									<button
										onclick={() => goto('/admin/form-drafts')}
										class="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
									>
										Create your first form
									</button>
								</div>
							{/if}
						</div>
					</div>

					<!-- Recent Published Forms -->
					<div class="content-card">
						<div class="section-header p-6">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold text-gray-800">Recent Published Forms</h3>
								<button
									onclick={() => goto('/admin/published-forms')}
									class="btn-blue px-4 py-2 text-sm"
								>
									View All
								</button>
							</div>
						</div>
						<div class="p-6 pt-0">
							{#if recentPublishedForms.length > 0}
								<div class="space-y-4">
									{#each recentPublishedForms as form}
										<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
											<div class="min-w-0 flex-1">
												<div class="flex items-center space-x-2">
													<h4 class="truncate text-sm font-medium text-gray-900">{form.name}</h4>
													{#if form.active}
														<span
															class="inline-flex flex-shrink-0 items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
														>
															Active
														</span>
													{:else}
														<span
															class="inline-flex flex-shrink-0 items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
														>
															Inactive
														</span>
													{/if}
												</div>
												{#if form.description}
													<p class="mt-1 truncate text-sm text-gray-500">{form.description}</p>
												{/if}
												<div class="mt-2 flex items-center space-x-4">
													<span class="text-xs text-gray-500">
														{form._count.responses} submissions
													</span>
													<span class="text-xs text-gray-500">
														Published {formatDate(form.publishedAt)}
													</span>
												</div>
											</div>
											<button
												onclick={() => goto(`/admin/published-forms/${form.id}`)}
												class="btn-green ml-2 flex-shrink-0 px-4 py-2 text-xs"
											>
												View
											</button>
										</div>
									{/each}
								</div>
							{:else}
								<div class="py-8 text-center">
									<svg
										class="mx-auto h-12 w-12 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<p class="mt-2 text-sm text-gray-500">No published forms yet</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="space-y-6">
				<!-- Calendar Widget -->
				<div class="content-card">
					<div class="section-header p-6">
						<h3 class="text-lg font-semibold text-gray-800">
							{new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
								month: 'long',
								year: 'numeric'
							})}
						</h3>
					</div>
					<div class="p-6 pt-0">
						<div class="grid grid-cols-7 gap-1 text-center text-sm">
							<div class="p-2 font-medium text-gray-500">S</div>
							<div class="p-2 font-medium text-gray-500">M</div>
							<div class="p-2 font-medium text-gray-500">T</div>
							<div class="p-2 font-medium text-gray-500">W</div>
							<div class="p-2 font-medium text-gray-500">T</div>
							<div class="p-2 font-medium text-gray-500">F</div>
							<div class="p-2 font-medium text-gray-500">S</div>

							{#each calendarDays as day}
								<div
									class="relative p-2 {day.isCurrentMonth
										? 'text-gray-900'
										: 'text-gray-400'} {day.isToday ? 'rounded bg-blue-100' : ''}"
								>
									<span class={day.isToday ? 'font-bold' : ''}>{day.day}</span>
									{#if day.events.length > 0}
										<div class="absolute bottom-0.5 left-1/2 -translate-x-1/2 transform">
											<div class="h-2 w-2 rounded-full bg-blue-500"></div>
										</div>
									{/if}
								</div>
							{/each}
						</div>

						{#if calendarEvents.length > 0}
							<div class="mt-4 border-t border-gray-200 pt-4">
								<h4 class="mb-2 text-sm font-medium text-gray-800">Form Events This Month</h4>
								<div class="space-y-2">
									{#each calendarEvents as event}
										<div class="text-xs text-gray-600">
											<div class="font-medium">{event.name}</div>
											{#if event.openDate}
												<div class="text-blue-600">Opens: {formatDate(event.openDate)}</div>
											{/if}
											{#if event.closeDate}
												<div class="text-red-600">Closes: {formatDate(event.closeDate)}</div>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Recent Announcements -->
				<div class="content-card">
					<div class="section-header p-6">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-800">Recent Announcements</h3>
							<button
								onclick={() => goto('/admin/announcements')}
								class="btn-blue px-4 py-2 text-sm"
							>
								View All
							</button>
						</div>
					</div>
					<div class="p-6 pt-0">
						{#if recentAnnouncements.length > 0}
							<div class="space-y-4">
								{#each recentAnnouncements as announcement}
									<div class="rounded-lg bg-gray-50 p-4">
										<h4 class="text-sm font-medium text-gray-900">{announcement.title}</h4>
										<p class="mt-1 line-clamp-2 text-sm text-gray-600">{announcement.message}</p>
										<div class="mt-2 flex items-center justify-between">
											<span class="text-xs text-gray-500">
												By {announcement.user.firstName}
												{announcement.user.lastName}
											</span>
											<span class="text-xs text-gray-500">
												{formatDate(announcement.createdAt)}
											</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<svg
									class="mx-auto h-12 w-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
									></path>
								</svg>
								<p class="mt-2 text-sm text-gray-500">No announcements yet</p>
								<button
									onclick={() => goto('/admin/announcements')}
									class="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
								>
									Create announcement
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.main-container {
		background-color: #f9fafb;
	}

	.content-card {
		background: white;
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
	}

	.section-header {
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 1.5rem;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
