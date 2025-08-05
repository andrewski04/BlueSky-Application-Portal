<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: any }>();

	let firstName = $state(data.user.firstName || '');
	let lastName = $state(data.user.lastName || '');
	let etsuApplicationComplete = $state(data.user.etsuApplicationComplete || false);
	let etsuEmail = $state(data.user.etsuEmail || '');
	let etsuENumber = $state(data.user.etsuENumber || '');
	let loading = $state(false);
</script>

<svelte:head>
	<title>Account Setup</title>
</svelte:head>

<div class="bg-secondary flex min-h-screen items-center justify-center">
	<div class="bg-primary mx-auto my-8 w-full max-w-lg rounded-lg p-12 text-white shadow-lg">
		<div class="text-inverted text-center">
			<h1 class="mb-4 text-3xl font-bold">Complete Your Profile</h1>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return ({ update }) => {
						loading = false;
						update();
					};
				}}
			>
				<input type="hidden" name="userId" value={data.user.id} />

				<!-- First and Last Name side by side -->
				<div class="mb-6 grid grid-cols-2 gap-4">
					<div>
						<label for="firstName" class="mb-2 block text-sm font-medium"> First Name </label>
						<input
							type="text"
							id="firstName"
							name="firstName"
							bind:value={firstName}
							class="form-input w-full text-black"
							required
						/>
					</div>

					<div>
						<label for="lastName" class="text-inverted mb-2 block text-sm font-medium">
							Last Name
						</label>
						<input
							type="text"
							id="lastName"
							name="lastName"
							bind:value={lastName}
							class="form-input w-full text-black"
							required
						/>
					</div>
				</div>

				<!-- ETSU Application Status -->
				<div class="mb-6">
					<label class="flex items-center">
						<input
							type="checkbox"
							name="etsuApplicationComplete"
							bind:checked={etsuApplicationComplete}
							class="mr-2 h-4 w-4"
						/>
						<span class="text-sm font-medium">Already applied or accepted to ETSU?</span>
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
							class="form-input w-full text-black"
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
							class="form-input w-full text-black"
							placeholder="e12345678"
						/>
					</div>
				{:else}
					<!-- Info box when not applied/accepted to ETSU -->
					<div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
						<div class="flex">
							<div class="ml-3">
								<p class="text-sm">
									You may continue, but ensure that you have submitted your application for ETSU
									before starting the BlueSky application. Once completed, you can update this
									information in your user settings.
								</p>
							</div>
						</div>
					</div>
				{/if}

				{#if form?.error}
					<div class="bg-error mb-6 rounded-md p-2 text-sm text-white">
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					class="btn flex w-full justify-center focus:outline-none disabled:opacity-70"
					disabled={loading}
				>
					{loading ? 'Saving...' : 'Complete Setup'}
				</button>

				<p class="text-md mt-6">
					Not {data.user.email}? <a href="/auth/logout" class="text-blue-400">Logout</a>
				</p>
			</form>
		</div>
	</div>
</div>
