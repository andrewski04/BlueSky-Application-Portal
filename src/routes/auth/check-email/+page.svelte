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

<div class="bg-secondary flex min-h-screen items-center justify-center">
	<div class="bg-primary mx-auto my-8 w-full max-w-lg rounded-lg p-12 shadow-lg">
		<div class="text-inverted text-center">
			<h1 class="mb-4 text-3xl font-bold text-white">Check your email</h1>
			<p class="mb-1 text-white">
				We've sent a login link to <strong>{data.email}</strong>
			</p>
			<p class="mb-6 text-white">You can close this page if the link is opened on this device.</p>
			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-neutral-600"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-primary-800 px-2 text-neutral-300">OR</span>
				</div>
			</div>

			<h2 class="mb-3 text-xl font-semibold text-white">Enter verification code</h2>
			<p class="mb-4 text-white">
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
				<div class="mb-4 text-white">
					<otp-input length="6" value={combinedOtp} onupdate={handleOtpChange}></otp-input>
					<input name="otp" value={combinedOtp} type="hidden" />
				</div>

				<input name="email" value={data.email} type="hidden" />

				{#if form?.error}
					<div class="text-error mb-4 text-sm">{form.error}</div>
				{/if}

				<button type="submit" class="btn flex w-full justify-center focus:outline-none">
					Verify
				</button>
			</form>

			<div class="mt-6">
				<a href="/auth/login" class="btn btn-danger p-2 text-xs">Back to login</a>
			</div>
		</div>
	</div>
</div>
