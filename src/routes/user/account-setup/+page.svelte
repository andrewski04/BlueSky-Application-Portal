<script lang="ts">
	import type { PageData } from './$types';
	import type { CountryCode, E164Number } from 'svelte-tel-input/types';
	import TelephoneInput from '$lib/components/util/TelephoneInput.svelte';
	import { enhance } from '$app/forms';
	import NProgress from 'nprogress';

	let { data, form } = $props<{ data: PageData; form: any }>();

	let phoneSelectedCountry: CountryCode = $state('US');
	let phoneValue: E164Number = $state(data.user.phoneNumber as E164Number);
	let phoneValid = $state(true);

	let firstName = $state(data.user.firstName || '');
	let lastName = $state(data.user.lastName || '');
	let etsuApplicationComplete = $state(data.user.etsuApplicationComplete || false);
	let etsuEmail = $state(data.user.etsuEmail || '');
	let etsuENumber = $state(data.user.etsuENumber || '');
	let loading = $state(false);
</script>

<svelte:head>
	<title>Account Setup - BlueSky Tennessee Institute</title>
	<style>
		.setup-prompt {
			background: linear-gradient(
				135deg,
				rgba(48, 97, 176, 1) 0%,
				rgba(31, 73, 163, 1) 50%,
				rgba(16, 51, 156, 1) 100%
			);
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	</style>
</svelte:head>

<div class="nprogressbar flex min-h-screen items-center justify-center bg-gray-300">
	<div class="setup-prompt mx-auto my-8 w-full max-w-lg rounded-lg p-12 text-white shadow-lg">
		<div class="text-inverted text-center">
			<h1 class="mb-4 text-3xl font-bold">Complete Your Profile</h1>

			<form
				method="POST"
				use:enhance={({ formData }: { formData: FormData }) => {
					loading = true;
					NProgress.start();
					formData.append('phoneNumber', phoneValue);
					return ({ update }) => {
						loading = false;
						NProgress.done();
						update();
					};
				}}
			>
				<input type="hidden" name="userId" value={data.user.id} />

				<!-- First and Last Name side by side -->
				<div class="mb-6 grid grid-cols-2 gap-4">
					<div>
						<label for="firstName" class="mb-2 block text-sm font-bold"> First Name </label>
						<input
							type="text"
							id="firstName"
							name="firstName"
							bind:value={firstName}
							placeholder="First Name"
							class="text-md w-full appearance-none rounded-lg border-1 border-blue-400 bg-white px-4 py-3 text-black outline-none focus:outline-2 focus:outline-blue-500"
							required
						/>
					</div>

					<div>
						<label for="lastName" class="text-inverted mb-2 block text-sm font-bold">
							Last Name
						</label>
						<input
							type="text"
							id="lastName"
							name="lastName"
							bind:value={lastName}
							class="text-md w-full appearance-none rounded-lg border-1 border-blue-400 bg-white px-4 py-3 text-black outline-none focus:outline-2 focus:outline-blue-500"
							required
							placeholder="Last Name"
						/>
					</div>
				</div>

				<div class="mb-6">
					<label for="phoneNumber" class="mb-2 block text-sm font-bold">
						Phone Number <span class="text-gray-400">(optional)</span></label
					>
					<TelephoneInput
						bind:value={phoneValue}
						bind:valid={phoneValid}
						bind:selectedCountry={phoneSelectedCountry}
						inputStyle="bg-white text-black text-md"
					/>
				</div>

				<!-- ETSU Application Status -->
				<div class="mb-6">
					<label class="flex cursor-pointer items-center justify-center">
						<input
							type="checkbox"
							name="etsuApplicationComplete"
							bind:checked={etsuApplicationComplete}
							class="mr-2 h-4 w-4 cursor-pointer"
						/>
						<span class="text-sm font-medium">Have you applied or been accepted to ETSU?</span>
					</label>
				</div>

				{#if etsuApplicationComplete}
					<p class="mb-6 text-sm">
						If you have not yet recieved the following, you may add them at any time in your user
						settings.
					</p>
					<!-- ETSU Email -->
					<div class="mb-6">
						<label for="etsuEmail" class="mb-2 block text-sm font-medium">
							ETSU Email <span class="text-gray-400">(optional)</span>
						</label>
						<input
							type="email"
							id="etsuEmail"
							name="etsuEmail"
							bind:value={etsuEmail}
							class="text-md w-full appearance-none rounded-lg border-1 border-blue-400 bg-white px-4 py-3 text-black outline-none focus:outline-2 focus:outline-blue-500"
							placeholder="yourname@etsu.edu"
						/>
					</div>

					<!-- ETSU eNumber -->
					<div class="mb-6">
						<label for="etsuENumber" class="mb-2 block text-sm font-medium">
							ETSU eNumber <span class="text-gray-400">(optional)</span>
						</label>
						<input
							type="text"
							id="etsuENumber"
							name="etsuENumber"
							bind:value={etsuENumber}
							class="text-md w-full appearance-none rounded-lg border-1 border-blue-400 bg-white px-4 py-3 text-black outline-none focus:outline-2 focus:outline-blue-500"
							placeholder="e12345678"
						/>
					</div>
				{:else}
					<!-- Info box when not applied/accepted to ETSU -->
					<div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-900">
						<div class="flex">
							<div class="ml-3">
								<p class="text-sm">
									You may continue, but complete your ETSU application before applying to BlueSky.
									Once complete, you can update this in your user settings.
								</p>
							</div>
						</div>
					</div>
				{/if}

				{#if form?.error}
					<div class="mb-6 rounded-md bg-red-500 p-2 text-sm text-white">
						{form.error}
					</div>
				{/if}

				<button type="submit" class="btn-green disabled:opacity-70" disabled={loading}>
					{loading ? 'Saving...' : 'Complete Setup'}
				</button>

				<p class="text-md mt-6">
					Not {data.user.email}? <a href="/auth/logout" class="font-bold text-red-500">Logout</a>
				</p>
			</form>
		</div>
	</div>
</div>
