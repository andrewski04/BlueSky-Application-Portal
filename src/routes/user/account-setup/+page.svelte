<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: any }>();

	let firstName = $state(data.user.firstName || '');
	let lastName = $state(data.user.lastName || '');
	let loading = $state(false);
</script>

<svelte:head>
	<title>Account Setup</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
			<p class="mt-3 text-gray-600">Please provide your name to complete your account setup.</p>
		</div>

		<div class="rounded-lg bg-white p-8 shadow-lg">
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

				<div class="mb-6">
					<label for="firstName" class="mb-2 block text-sm font-medium text-gray-700">
						First Name
					</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						bind:value={firstName}
						class="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						required
					/>
				</div>

				<div class="mb-6">
					<label for="lastName" class="mb-2 block text-sm font-medium text-gray-700">
						Last Name
					</label>
					<input
						type="text"
						id="lastName"
						name="lastName"
						bind:value={lastName}
						class="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						required
					/>
				</div>

				{#if form?.error}
					<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
					disabled={loading}
				>
					{loading ? 'Saving...' : 'Complete Setup'}
				</button>
			</form>
		</div>
	</div>
</div>
