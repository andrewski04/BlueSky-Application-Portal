<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Verification Code - BlueSky Tennessee Institute</title>
	<style>
		.otp-prompt {
			background: linear-gradient(
				135deg,
				rgba(48, 97, 176, 1) 0%,
				rgba(31, 73, 163, 1) 50%,
				rgba(16, 51, 156, 1) 100%
			);
		}

		.otp-prompt:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	</style>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-300">
	<div class="otp-prompt mx-auto my-8 w-full max-w-lg rounded-lg p-12 text-white shadow-lg">
		<div class="text-inverted text-center">
			<h1 class="mb-4 text-3xl font-bold">Verification Code</h1>

			{#if data.otp}
				<div class="mb-6">
					<p class="mb-3">Enter this verification code on your original device:</p>

					<div class="flex justify-center">
						<div class="bg-primary-700 rounded-lg px-6 py-4 font-mono text-3xl tracking-widest">
							{data.otp}
						</div>
					</div>
				</div>

				<div class="mt-8">
					<p class="text-sm text-neutral-300">This code will expire in 10 minutes.</p>
				</div>
			{:else}
				<div class="text-red-500">Invalid or expired token. Please request a new login link.</div>

				<div class="mt-6">
					<a href="/auth/login" class="btn-blueinline-block focus:outline-none">
						Return to Login
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
