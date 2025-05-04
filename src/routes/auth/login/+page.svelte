<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	const error = page.url.searchParams.get('error');
	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="bg-secondary flex min-h-screen items-center justify-center">
	<div class="bg-primary mx-auto my-8 w-full max-w-lg rounded-lg p-12 shadow-lg">
		<div class="text-inverted text-center">
			<h2 class="mb-4 text-3xl font-extrabold text-white">Sign in to your account</h2>
			<p class="mb-8 text-lg text-white">We'll send a login link to your email</p>

			{#if form?.error || error === 'invalid_token'}
				<div class="bg-error mb-4 rounded-md p-2">
					<h3 class="text-center text-sm font-medium text-white">
						{error === 'invalid_token'
							? 'Token invalid or expired. Please try again.'
							: form?.error}
					</h3>
				</div>
			{/if}

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
							class="form-input block w-full appearance-none focus:outline-1 sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<button type="submit" class="btn flex w-full justify-center focus:outline-none">
						Login
					</button>
				</div>

				<div class="text-center">
					<p class="text-sm text-white">
						Don't have an account?
						<a href="/auth/register" class="text-blue-300 hover:underline">Register</a>
					</p>
				</div>
			</form>
		</div>
	</div>
</div>
