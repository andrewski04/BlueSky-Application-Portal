<script lang="ts">
	import type { PageData } from './$types';
	import UserNavBar from '$lib/components/dashboard/UserNavBar.svelte';

	let { data }: { data: PageData } = $props();
	let { user, applicationFormsError, applicationForms, announcementsError, announcements } = data;

	// Add reactive variables for carousel functionality
	let currentAnnouncementIndex = $state(0);

	// Functions to navigate between announcements
	function nextAnnouncement() {
		if (announcements && announcements.length > 0) {
			currentAnnouncementIndex = (currentAnnouncementIndex + 1) % announcements.length;
		}
	}

	function previousAnnouncement() {
		if (announcements && announcements.length > 0) {
			currentAnnouncementIndex =
				currentAnnouncementIndex === 0 ? announcements.length - 1 : currentAnnouncementIndex - 1;
		}
	}

	// Get current announcement
	let currentAnnouncement = $derived(
		announcements && announcements.length > 0 ? announcements[currentAnnouncementIndex] : null
	);
</script>

<svelte:head>
	<title>Dashboard - BlueSky Institute</title>
	<style>
		.main-container {
			background: linear-gradient(
				180deg,
				rgba(239, 246, 255, 0.5) 0%,
				rgba(219, 234, 254, 0.3) 50%,
				rgba(147, 197, 253, 0.1) 100%
			);
		}

		.welcome-banner {
			background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
			color: white;
			padding: 2rem;
			border-radius: 16px;
			margin-bottom: 2rem;
			box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
			position: relative;
			overflow: hidden;
		}

		.welcome-banner::before {
			content: '';
			position: absolute;
			top: -50%;
			right: -20%;
			width: 60%;
			height: 200%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
			transform: rotate(15deg);
		}

		.welcome-banner h1 {
			position: relative;
			z-index: 1;
		}

		.welcome-banner p {
			position: relative;
			z-index: 1;
			opacity: 0.9;
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
			padding: 1.5rem;
			border-radius: 16px 16px 0 0;
		}

		.announcement-carousel {
			position: relative;
			min-height: 100px;
		}

		.carousel-content {
			padding: 1.5rem 1.5rem 0 1.5rem;
			transition: all 0.3s ease;
		}

		.carousel-nav {
			background: rgba(59, 130, 246, 0.1);
			border: none;
			border-radius: 50%;
			width: 32px;
			height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: all 0.3s ease;
		}

		.carousel-nav:hover {
			background: rgba(59, 130, 246, 0.2);
			transform: scale(1.1);
		}

		.carousel-nav:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}

		.carousel-bottom-controls {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 1rem;
			padding: 0.5rem;
		}

		.carousel-indicators {
			display: flex;
			gap: 0.5rem;
		}

		.carousel-indicator {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: rgba(59, 130, 246, 0.3);
			cursor: pointer;
			transition: all 0.3s ease;
		}

		.carousel-indicator.active {
			background: rgba(59, 130, 246, 0.8);
			transform: scale(1.2);
		}

		.start-form-button {
			background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
			box-shadow:
				0 4px 16px rgba(16, 185, 129, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			color: white;
			border-radius: 8px;
			font-weight: 600;
			transition: all 0.3s ease;
			cursor: pointer;
			font-size: 0.875rem;
		}

		.start-form-button::before {
			content: '';
			position: absolute;
			pointer-events: none;

			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			transition: left 0.5s ease;
		}

		.start-form-button:hover {
			background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
			box-shadow:
				0 6px 20px rgba(16, 185, 129, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: translateY(-1px);
		}

		.start-form-button:hover::before {
			left: 100%;
		}
	</style>
</svelte:head>

<div class="main-container min-h-screen">
	<UserNavBar message={`Application Portal`} />

	<div class="mx-auto max-w-6xl px-4 py-8">
		<!-- Welcome Banner -->
		<div class="welcome-banner">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="mb-2 text-2xl font-bold">Welcome, {user.firstName}!</h1>
					<p class="text-lg">Manage your applications and stay updated with announcements.</p>
				</div>
				<div class="hidden md:block">
					<svg class="h-16 w-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						></path>
					</svg>
				</div>
			</div>
		</div>

		<!-- Announcements Section -->
		<div class="content-card mb-8">
			<div class="section-header">
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
							d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
						></path>
					</svg>
					Recent Announcements
				</h2>
			</div>

			{#if announcements && announcements.length > 0}
				<div class="announcement-carousel">
					<!-- Current Announcement Content -->
					<div class="carousel-content">
						{#if currentAnnouncement}
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h3 class="mb-2 text-lg font-semibold text-gray-800">
										{currentAnnouncement.title}
									</h3>
									<p class="mb-4 text-gray-600">{currentAnnouncement.message}</p>
									<div class="text-sm text-gray-500">
										<span
											>Posted by {currentAnnouncement.user.firstName}
											{currentAnnouncement.user.lastName}</span
										>
									</div>
								</div>
								<div class="ml-4 text-sm text-gray-400">
									{new Date(currentAnnouncement.createdAt).toLocaleString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
							</div>
						{/if}
					</div>

					<!-- Bottom Controls: Navigation Arrows and Indicators -->
					{#if announcements.length > 1}
						<div class="carousel-bottom-controls">
							<!-- Previous Button -->
							<button
								class="carousel-nav prev"
								onclick={previousAnnouncement}
								aria-label="Previous announcement"
							>
								<svg
									class="h-4 w-4 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									></path>
								</svg>
							</button>

							<!-- Indicators -->
							<div class="carousel-indicators">
								{#each announcements as _, index}
									<button
										class="carousel-indicator {index === currentAnnouncementIndex ? 'active' : ''}"
										onclick={() => (currentAnnouncementIndex = index)}
										aria-label="Go to announcement {index + 1}"
									></button>
								{/each}
							</div>

							<!-- Next Button -->
							<button
								class="carousel-nav next"
								onclick={nextAnnouncement}
								aria-label="Next announcement"
							>
								<svg
									class="h-4 w-4 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									></path>
								</svg>
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<div class="space-y-4 rounded-b-lg py-6">
					{#if announcementsError}
						<p class="text-center font-bold text-red-500">{announcementsError}</p>
					{/if}
					<p class="text-center text-gray-500">No announcements at this time.</p>
				</div>
			{/if}
		</div>

		<!-- Available Application Forms Section -->
		<div class="content-card">
			<div class="section-header">
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
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						></path>
					</svg>
					Available Application Forms
				</h2>
			</div>
			<div class="w-full rounded-b-lg bg-white shadow-md">
				<div class="space-y-4 rounded-b-lg py-6">
					{#if applicationFormsError}
						<p class="text-center font-bold text-red-500">{applicationFormsError}</p>
					{/if}
					{#if !applicationForms || applicationForms.length === 0}
						<p class="text-center text-gray-500">No application forms found</p>
					{/if}
				</div>

				{#if applicationForms && applicationForms.length > 0}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-4 py-3 text-left font-semibold tracking-wide text-gray-700 uppercase">
									Name
								</th>
								<th class="px-4 py-3 text-left font-semibold tracking-wide text-gray-700 uppercase">
									Description
								</th>
								<th class="px-4 py-3 text-left font-semibold tracking-wide text-gray-700 uppercase">
									Status
								</th>
								<th class="px-4 py-3 text-left font-semibold tracking-wide text-gray-700 uppercase">
									Due Date
								</th>
								<th class="px-4 py-3 text-left font-semibold tracking-wide text-gray-700 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each applicationForms as form}
								<tr class="hover:bg-gray-100">
									<td class="text-medium px-4 py-4 whitespace-nowrap text-black">{form.name}</td>
									<td class="text-medium px-4 py-4 text-black"
										>{form.description || 'No description'}</td
									>
									<td class="text-medium px-4 py-4 text-black">
										{#if !form.responses[0]}
											<span class="text-red-600">Not Started</span>
										{:else if form.responses[0].status == 'DRAFT'}
											<span class="text-yellow-600">Draft</span>
										{:else}
											<span class="text-green-600">Submitted</span>
										{/if}
									</td>
									<td class="text-medium px-4 py-4 text-black">
										{#if form.closeDate}
											{new Date(form.closeDate).toLocaleString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										{:else}
											No due date
										{/if}
									</td>
									<td class="text-md px-4 py-2 whitespace-nowrap">
										<a
											href="/application/form/{form.id}"
											class="start-form-button flex items-center justify-center px-4 py-2"
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
													d="M9 5l7 7-7 7"
												></path>
											</svg>
											{#if !form.responses[0]}
												Start
											{:else if form.responses[0].status == 'DRAFT'}
												Resume
											{:else}
												View
											{/if}
										</a>
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
