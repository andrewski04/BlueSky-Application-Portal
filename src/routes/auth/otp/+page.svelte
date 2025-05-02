<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="bg-secondary flex min-h-screen items-center justify-center">
	<div class="bg-primary mx-auto my-8 w-full max-w-lg rounded-lg p-12 text-white shadow-lg">
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
				<div class="text-error-300">Invalid or expired token. Please request a new login link.</div>

				<div class="mt-6">
					<a href="/auth/login" class="btn inline-block focus:outline-none"> Return to Login </a>
				</div>
			{/if}
		</div>
	</div>
</div>
