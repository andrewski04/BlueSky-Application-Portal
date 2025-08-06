<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	const error = page.url.searchParams.get('error');
	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Register - BlueSky Tennessee Institute</title>
	<style>
		.register-prompt {
			background: linear-gradient(
				135deg,
				rgba(48, 97, 176, 1) 0%,
				rgba(31, 73, 163, 1) 50%,
				rgba(16, 51, 156, 1) 100%
			);
		}

		.register-prompt:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	</style>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-300">
	<div class="register-prompt mx-auto w-full max-w-lg space-y-8 rounded-lg p-12 shadow-lg">
		<div class="rounded-lg bg-white p-3 shadow-lg/50">
			<img
				src="/pictures/BlueSky_ETSU_Horizontal.png"
				alt="BlueSky Institute"
				class="mx-auto h-30"
			/>
		</div>
		{#if form?.error || error === 'invalid_token'}
			<div class="rounded-md bg-red-500 p-2">
				<h3 class="text-center text-sm font-medium text-white">
					{error === 'invalid_token' ? 'Token invalid or expired. Please try again.' : form?.error}
				</h3>
			</div>
		{/if}

		<div class="space-y-4 text-center">
			<h2 class="text-3xl font-extrabold text-white">Create a new account</h2>
			<p class="text-lg text-white">We'll send a verification link to your email.</p>

			<form class="space-y-6" method="POST">
				<div>
					<div class="mt-1">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							placeholder="Enter your email"
							class="block w-full appearance-none rounded-lg bg-white px-4 py-2 text-lg outline-none focus:outline-2 focus:outline-blue-500"
						/>
					</div>
				</div>

				<div>
					<button type="submit" class="btn-green px-6 py-3"> Register </button>
				</div>

				<div class="text-center">
					<p class="text-sm text-white">
						Already have an account?
						<a href="/auth/login" class="text-blue-300 hover:underline">Login</a>
					</p>
				</div>
			</form>
		</div>
	</div>
</div>
