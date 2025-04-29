<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-4 text-2xl font-bold text-gray-800">Verification Code</h1>

	{#if data.otp}
		<div class="mb-6">
			<p class="mb-3 text-gray-600">Enter this verification code on your original device:</p>

			<div class="flex justify-center">
				<div class="rounded-lg bg-gray-100 px-6 py-4 font-mono text-3xl tracking-widest">
					{data.otp}
				</div>
			</div>
		</div>

		<div class="mt-8">
			<p class="text-center text-sm text-gray-500">This code will expire in 10 minutes.</p>
		</div>
	{:else}
		<div class="text-red-500">Invalid or expired token. Please request a new login link.</div>

		<div class="mt-6 text-center">
			<a
				href="/auth/login"
				class="inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				Return to Login
			</a>
		</div>
	{/if}
</div>
