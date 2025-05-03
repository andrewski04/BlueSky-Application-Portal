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

<div class="bg-secondary flex min-h-screen items-center justify-center">
	<div class="bg-primary mx-auto my-8 w-full max-w-lg rounded-lg p-12 text-white shadow-lg">
		<div class="text-inverted text-center">
			<h1 class="mb-4 text-3xl font-bold">Complete Your Profile</h1>
			<p class="mb-2 text-lg">Please setup your profile to continue.</p>

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

				<div class="mb-6">
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
