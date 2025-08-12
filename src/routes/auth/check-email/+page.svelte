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

<svelte:head>
	<title>Verify Login - BlueSky Tennessee Institute</title>
	<style>
		.check-email-prompt {
			background: linear-gradient(
				135deg,
				rgba(48, 97, 176, 1) 0%,
				rgba(31, 73, 163, 1) 50%,
				rgba(16, 51, 156, 1) 100%
			);
		}

		.check-email-prompt:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	</style>
</svelte:head>

<div class="nprogressbar flex min-h-screen items-center justify-center bg-gray-300">
	<div class="check-email-prompt mx-auto my-8 w-full max-w-lg rounded-lg p-12 shadow-lg">
		<div class="text-inverted text-center">
			<h1 class="mb-4 text-3xl font-bold text-white">Check your email</h1>
			<p class="mb-2 text-white">
				We've sent a login link to <strong>{data.email}</strong>
			</p>
			<p class="mb-6 text-sm text-white">
				If the link is opened on this device, you will be automatically logged in and can close this
				page.
			</p>
			<div class="my-6 flex items-center">
				<hr class="flex-grow border-t border-white" />
				<span class="bg-primary-800 mx-4 rounded px-2 text-sm text-white">OR</span>
				<hr class="flex-grow border-t border-white" />
			</div>

			<h2 class="mb-3 text-xl font-semibold text-white">Enter verification code</h2>
			<p class="mb-4 text-white">
				If you open the link on a different device, you will be shown a verification code to enter
				below:
			</p>

			<form
				method="POST"
				action="?/verifyOtp"
				class="space-y-4"
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
					<div class="rounded-md bg-red-500 p-2">
						<h3 class="text-center text-sm font-medium text-white">{form.error}</h3>
					</div>
				{/if}

				<button type="submit" class="btn-green px-12 py-2">Verify</button>
			</form>

			<div class="mt-6">
				<a href="/auth/login" class="btn-red p-2 text-xs">Back to login</a>
			</div>
		</div>
	</div>
</div>
