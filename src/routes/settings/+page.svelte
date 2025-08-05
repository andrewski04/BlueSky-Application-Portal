<script lang="ts">
	import type { PageData } from './$types';

	import UserNavBar from '$lib/components/dashboard/UserNavBar.svelte';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';

	let { data }: { data: PageData } = $props();
	let { user } = data;
</script>

<svelte:head>
	<title>Account Settings</title>
	<style>
		.settings-container {
			background: linear-gradient(
				180deg,
				rgba(239, 246, 255, 0.5) 0%,
				rgba(219, 234, 254, 0.3) 50%,
				rgba(147, 197, 253, 0.1) 100%
			);
		}

		.settings-card {
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

		.settings-card:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.15),
				0 6px 20px rgba(0, 0, 0, 0.08);
			transform: translateY(-2px);
		}

		.settings-section {
			border-bottom: 1px solid rgba(59, 130, 246, 0.1);
			padding: 1.5rem;
		}

		.settings-section:last-child {
			border-bottom: none;
		}

		.setting-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1rem 0;
			border-bottom: 1px solid rgba(59, 130, 246, 0.05);
		}

		.setting-item:last-child {
			border-bottom: none;
		}

		.settings-input {
			background: linear-gradient(
				135deg,
				rgba(255, 255, 255, 0.9) 0%,
				rgba(248, 250, 252, 0.8) 100%
			);
			border: 1px solid rgba(59, 130, 246, 0.2);
			border-radius: 8px;
			padding: 0.75rem 1rem;
			transition: all 0.3s ease;
			backdrop-filter: blur(5px);
		}

		.settings-input:focus {
			outline: none;
			border-color: #3b82f6;
			box-shadow:
				0 0 0 3px rgba(59, 130, 246, 0.1),
				0 4px 16px rgba(59, 130, 246, 0.1);
		}

		.save-button {
			background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
			box-shadow:
				0 4px 16px rgba(59, 130, 246, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.2);
			color: white;
			border-radius: 8px;
			padding: 0.75rem 2rem;
			font-weight: 600;
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
			cursor: pointer;
			border: none;
		}

		.save-button::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			transition: left 0.5s ease;
		}

		.save-button:hover {
			background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
			box-shadow:
				0 6px 20px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: translateY(-1px);
		}

		.save-button:hover::before {
			left: 100%;
		}

		.logout-button {
			background: linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%);
			box-shadow:
				0 4px 16px rgba(107, 114, 128, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.2);
			color: white;
			border-radius: 8px;
			padding: 0.75rem 1.5rem;
			font-weight: 600;
			transition: all 0.3s ease;
			cursor: pointer;
			border: none;
		}

		.logout-button:hover {
			background: linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%);
			box-shadow:
				0 6px 20px rgba(107, 114, 128, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: translateY(-1px);
		}

		.change-password-button {
			background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
			box-shadow:
				0 4px 16px rgba(5, 150, 105, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.2);
			color: white;
			border-radius: 8px;
			padding: 0.75rem 1.5rem;
			font-weight: 600;
			transition: all 0.3s ease;
			cursor: pointer;
			border: none;
		}

		.change-password-button:hover {
			background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
			box-shadow:
				0 6px 20px rgba(5, 150, 105, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: translateY(-1px);
		}

		.password-section {
			background: linear-gradient(
				135deg,
				rgba(255, 255, 255, 0.95) 0%,
				rgba(248, 250, 252, 0.9) 100%
			);
			border: 1px solid rgba(5, 150, 105, 0.1);
			border-radius: 12px;
			padding: 1.5rem;
			margin-top: 1rem;
			display: none;
		}

		.password-section.active {
			display: block;
			animation: slideDown 0.3s ease-out;
		}

		@keyframes slideDown {
			from {
				opacity: 0;
				transform: translateY(-10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.form-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;
			align-items: end;
		}

		@media (max-width: 768px) {
			.form-row {
				grid-template-columns: 1fr;
			}
		}

		.button-group {
			display: flex;
			flex-direction: row;
			gap: 0.75rem;
			align-items: center;
			justify-content: center;
			width: 100%;
			flex-wrap: wrap;
		}

		.button-group button {
			min-width: 150px;
			text-align: center;
		}

		@media (max-width: 640px) {
			.button-group {
				flex-direction: column;
				align-items: center;
			}

			.button-group button {
				width: 200px;
			}
		}
	</style>
</svelte:head>

<div class="bg-secondary min-h-screen">
	{#if user.role === 'USER'}
		<UserNavBar message={`User Settings`} />
	{:else}
		<AdminNavBar message={`Admin Settings`} />
	{/if}

	<!-- Settings Content -->
	<div class="settings-container max-h-screen">
		<div class="mx-auto max-w-4xl px-4 py-8">
			<!-- Page Header -->
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-800">Account Settings</h1>
				<p class="text-red-600">NOT IMPLEMENTED!!</p>
			</div>

			<!-- Account Information Card -->
			<div class="settings-card mb-6">
				<div class="settings-section">
					<h2 class="mb-4 flex items-center text-xl font-semibold text-gray-800">
						<svg
							class="mr-2 h-5 w-5 text-blue-600"
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
						Account Information
					</h2>

					<!-- First Name and Last Name Row -->
					<div class="setting-item">
						<div class="form-row w-full">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">First Name</label>
								<input
									type="text"
									class="settings-input w-full"
									placeholder="Enter your first name"
									value={user.firstName}
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
								<input
									type="text"
									class="settings-input w-full"
									placeholder="Enter your last name"
									value={user.lastName}
								/>
							</div>
						</div>
					</div>

					<!-- Personal Email and Phone Number Row -->
					<div class="setting-item">
						<div class="form-row w-full">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700"
									>Personal Email Address</label
								>
								<input
									type="email"
									class="settings-input w-full"
									placeholder="Enter your personal email address"
									value={user.email}
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
								<input
									type="tel"
									class="settings-input w-full"
									placeholder="Enter your phone number"
									value={user.phoneNumber}
								/>
							</div>
						</div>
					</div>

					<!-- ETSU Email and eNumber Row -->
					<div class="setting-item">
						<div class="form-row w-full">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700"
									>ETSU Email Address</label
								>
								<input
									type="email"
									class="settings-input w-full"
									placeholder="Enter your ETSU email address"
									value={user.etsuEmail}
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">ETSU eNumber</label>
								<input
									type="text"
									class="settings-input w-full"
									placeholder="Enter your ETSU eNumber"
									value={user.etsuENumber}
								/>
							</div>
						</div>
					</div>

					<!-- Action Buttons - Now Stacked Vertically -->
					<div class="setting-item">
						<div class="button-group">
							<button class="save-button">
								<svg
									class="mr-2 inline h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
								Save Changes
							</button>
							<button class="change-password-button">
								<svg
									class="mr-2 inline h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									></path>
								</svg>
								Change Password
							</button>
							<button class="logout-button">
								<svg
									class="mr-2 inline h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									></path>
								</svg>
								Log Out
							</button>
						</div>
					</div>

					<!-- Password Change Section (Hidden by default) -->
					<div id="passwordSection" class="password-section">
						<h3 class="mb-4 flex items-center text-lg font-semibold text-gray-800">
							<svg
								class="mr-2 h-5 w-5 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								></path>
							</svg>
							Change Password
						</h3>

						<div class="space-y-4">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
								<input
									type="password"
									id="currentPassword"
									class="settings-input w-full max-w-md"
									placeholder="Enter current password"
								/>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">New Password</label>
								<input
									type="password"
									id="newPassword"
									class="settings-input w-full max-w-md"
									placeholder="Enter new password"
								/>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700"
									>Confirm New Password</label
								>
								<input
									type="password"
									id="confirmPassword"
									class="settings-input w-full max-w-md"
									placeholder="Confirm new password"
								/>
							</div>

							<div class="flex gap-3 pt-2">
								<button class="save-button">
									<svg
										class="mr-2 inline h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										></path>
									</svg>
									Update Password
								</button>
								<button class="logout-button">
									<svg
										class="mr-2 inline h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										></path>
									</svg>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
