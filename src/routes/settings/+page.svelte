<script lang="ts">
	import type { PageProps } from './$types';
	import type { CountryCode, E164Number } from 'svelte-tel-input/types';
	import UserNavBar from '$lib/components/dashboard/UserNavBar.svelte';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	import TelephoneInput from '$lib/components/util/TelephoneInput.svelte';
	import { enhance, applyAction } from '$app/forms';
	import NProgress from 'nprogress';
	import { onMount } from 'svelte';

	let { data, form }: PageProps = $props();
	let user = $state(data.user);
	let { role, isAdmin } = data;

	let phoneSelectedCountry: CountryCode = $state('US');
	// svelte-ignore state_referenced_locally - we only need the initial value
	//let phoneValue: E164Number = $state(user.phoneNumber as E164Number);
	// svelte-ignore state_referenced_locally - we only need the initial value
	//let etsuAppComplete = $state(user.etsuApplicationComplete || false);
	let phoneValid = $state(true);

	onMount(() => {
		const inputs = document.querySelectorAll('input');
		inputs.forEach((input) => {
			input.addEventListener('keydown', (event: KeyboardEvent) => {
				if (event.key === 'Enter') {
					event.preventDefault();
				}
			});
		});
	});
</script>

<svelte:head>
	<title>Account Settings</title>
	<style>
		.settings-section {
			padding: 1.5rem;
		}

		.setting-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1rem 0;
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
			background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
			box-shadow:
				0 4px 16px rgba(239, 68, 68, 0.3),
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

		.logout-button::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			transition: left 0.5s ease;
		}

		.logout-button:hover {
			background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
			box-shadow:
				0 6px 20px rgba(239, 68, 68, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: translateY(-1px);
		}

		.logout-button:hover::before {
			left: 100%;
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
			gap: 1rem;
			align-items: center;
			justify-content: space-between;
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
		}
	</style>
</svelte:head>

<div class="main-container min-h-screen">
	{#if role === 'USER'}
		<UserNavBar message={`Your Account Settings`} />
	{:else}
		<AdminNavBar message={`Admin Account Settings`} />
	{/if}

	<!-- Settings Content -->
	<div>
		<div class="mx-auto max-w-4xl px-4 py-8">
			<!-- Page Header -->
			<div class="mb-6 text-center">
				<h1 class="mb-4 text-3xl font-bold text-gray-800">Account Settings</h1>
				{#if form && form.success}
					<p class="text-green-600">{form.message}</p>
				{:else if form && form.error}
					<p class="text-red-600">{form.error}</p>
				{/if}
			</div>

			<!-- Account Information Card -->
			<div class="content-card">
				<form
					class="settings-section"
					method="POST"
					action="?/saveAccountInfo"
					use:enhance={({ formData }: { formData: FormData }) => {
						formData.append('etsuApplicationComplete', user.etsuApplicationComplete.toString());
						formData.append('phoneNumber', user.phoneNumber || '');

						NProgress.start();
						return async ({ result }) => {
							if (result.type === 'success' && result.data && result.data.user) {
								user = result.data.user as typeof user;
							}
							applyAction(result);
							NProgress.done();
						};
					}}
				>
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
								<label class="mb-1 block text-sm font-medium text-gray-700" for="firstName"
									>First Name</label
								>
								<input
									type="text"
									name="firstName"
									class="settings-input w-full"
									placeholder="Enter your first name"
									value={user.firstName}
									required
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700" for="lastName"
									>Last Name</label
								>
								<input
									type="text"
									name="lastName"
									class="settings-input w-full"
									placeholder="Enter your last name"
									value={user.lastName}
									required
								/>
							</div>
						</div>
					</div>

					<hr class=" border-[rgb(59,130,246)]/20" />

					<!-- Personal Email and Phone Number Row -->
					<div class="setting-item">
						<div class="form-row w-full">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700" for="personalEmail"
									>Personal Email Address</label
								>
								<input
									type="email"
									name="email"
									id="email"
									class="settings-input w-full disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Enter your personal email address"
									value={user.email}
									disabled={true}
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700" for="phoneNumber"
									>Phone Number</label
								>
								<TelephoneInput
									bind:value={user.phoneNumber as E164Number}
									bind:valid={phoneValid}
									bind:selectedCountry={phoneSelectedCountry}
								/>
							</div>
						</div>
					</div>

					<hr class=" border-[rgb(59,130,246)]/20" />

					<!-- ETSU Application Status -->
					<div class="mt-4">
						<label class="flex items-center">
							<input
								type="checkbox"
								name="etsuApplicationComplete"
								class="mr-2 h-4 w-4"
								bind:checked={user.etsuApplicationComplete}
							/>
							<span class="text-sm font-medium">Have you applied or been accepted to ETSU?</span>
						</label>
					</div>

					<!-- ETSU Email and eNumber Row -->
					<div class="setting-item">
						<div class="form-row w-full">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700" for="etsuEmail"
									>ETSU Email Address</label
								>
								<input
									disabled={!user.etsuApplicationComplete}
									type="email"
									name="etsuEmail"
									class="settings-input w-full disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Enter your ETSU email address"
									value={user.etsuEmail}
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700" for="etsuENumber"
									>ETSU eNumber</label
								>
								<input
									type="text"
									name="etsuENumber"
									class="settings-input w-full disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Enter your ETSU eNumber"
									value={user.etsuENumber}
									disabled={!user.etsuApplicationComplete}
								/>
							</div>
						</div>
					</div>

					{#if isAdmin}
						<hr class=" border-[rgb(59,130,246)]/20" />

						<h2 class="my-4 flex items-center text-xl font-semibold text-gray-800">
							<svg class="mr-2 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 1920 1920">
								<path
									d="M276.941 440.584v565.722c0 422.4 374.174 625.468 674.71 788.668l8.02 4.292 8.131-4.292c300.537-163.2 674.71-366.268 674.71-788.668V440.584l-682.84-321.657L276.94 440.584Zm682.73 1479.529c-9.262 0-18.523-2.372-26.993-6.89l-34.9-18.974C588.095 1726.08 164 1495.906 164 1006.306V404.78c0-21.91 12.65-41.788 32.414-51.162L935.727 5.42c15.134-7.228 32.866-7.228 48 0l739.313 348.2c19.765 9.374 32.414 29.252 32.414 51.162v601.525c0 489.6-424.207 719.774-733.779 887.943l-34.899 18.975c-8.47 4.517-17.731 6.889-27.105 6.889Zm467.158-547.652h-313.412l-91.595-91.482v-83.803H905.041v-116.78h-83.69l-58.503-58.504c-1.92.113-3.84.113-5.76.113-176.075 0-319.285-143.21-319.285-319.285 0-176.075 143.21-319.398 319.285-319.398 176.075 0 319.285 143.323 319.285 319.398 0 1.92 0 3.84-.113 5.647l350.57 350.682v313.412Zm-266.654-112.941h153.713v-153.713L958.462 750.155l3.953-37.27c1.017-123.897-91.595-216.621-205.327-216.621S550.744 588.988 550.744 702.72c0 113.845 92.612 206.344 206.344 206.344l47.21-5.309 63.811 63.7h149.873v116.78h116.781v149.986l25.412 25.299Zm-313.4-553.57c0 46.758-37.949 84.706-84.706 84.706-46.758 0-84.706-37.948-84.706-84.706s37.948-84.706 84.706-84.706c46.757 0 84.706 37.948 84.706 84.706"
									fill-rule="evenodd"
								/>
							</svg>
							Admin Settings
						</h2>
						<p class="mb-4 max-w-2/3 text-sm text-gray-600">
							Switch role will temporarily set you as a user, allowing you to view the user
							dashboard and fill application forms. This can be switched back at any time.
						</p>
						<a href="/auth/impersonate" class="btn-blue text-md px-2 py-1">Switch Role</a>
					{/if}

					<!-- Action Buttons  -->
					<div class="setting-item">
						<div class="button-group">
							<a href="/auth/logout" class="logout-button">
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
							</a>
							<button class="save-button" type="submit">
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
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
