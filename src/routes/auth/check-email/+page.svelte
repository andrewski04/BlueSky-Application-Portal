<script lang="ts">
	import { enhance } from '$app/forms';
	import '$lib/components/auth/otpInput.svelte';

	const { data, form } = $props();
	let combinedOtp = $state('');

	// pull otp from input component event
	function handleOtpChange(event: CustomEvent) {
		combinedOtp = event.detail;
	}
</script>

<div class="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-4 text-center text-2xl font-bold text-gray-800">Check your email</h1>
	<p class="mb-1 text-center text-gray-600">
		We've sent a login link to <strong>{data.email}</strong>
	</p>
	<p class="mb-6 text-center text-gray-600">
		You can close this page if the magic link is opened on this device.
	</p>
	<div class="relative my-6">
		<div class="absolute inset-0 flex items-center">
			<div class="w-full border-t border-gray-300"></div>
		</div>
		<div class="relative flex justify-center text-sm">
			<span class="bg-white px-2 text-gray-500">OR</span>
		</div>
	</div>

	<h2 class="mb-3 text-center text-xl font-semibold text-gray-800">Enter verification code</h2>
	<p class="mb-4 text-center text-gray-600">
		If you're using a different device, open the link on that device to get a verification code,
		then enter it below:
	</p>

	<form
		method="POST"
		action="?/verifyOtp"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
				combinedOtp = '';
			};
		}}
	>
		<div class="mb-4">
			<label for="otp-container" class="mb-1 block text-sm font-medium text-gray-700"
				>Verification Code</label
			>
			<otp-input length="6" value={combinedOtp} onupdate={handleOtpChange}></otp-input>
			<input name="otp" value={combinedOtp} type="hidden" />
		</div>

		<input name="email" value={data.email} type="hidden" />

		{#if form?.error}
			<div class="mb-4 text-sm text-red-500">{form.error}</div>
		{/if}

		<button
			type="submit"
			class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
		>
			Verify
		</button>
	</form>

	<div class="mt-6 text-center">
		<a href="/auth/login" class="text-sm text-indigo-600 hover:text-indigo-500">Back to login</a>
	</div>
</div>
