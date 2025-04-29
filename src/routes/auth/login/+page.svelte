<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	const error = page.url.searchParams.get('error');
	let { form }: PageProps = $props();
</script>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
		<p class="mt-2 text-center text-sm text-gray-600">We'll send you a magic link to your email</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
			<form class="space-y-6" method="POST">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
					<div class="mt-1">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							placeholder="Enter your email"
							class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
						/>
					</div>
				</div>

				{#if form?.error || error === 'invalid_token'}
					<div class="rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="ml-3">
								<h3 class="text-sm font-medium text-red-800">
									{error === 'invalid_token'
										? 'Magic link invalid or expired. Please try again.'
										: form?.error}
								</h3>
							</div>
						</div>
					</div>
				{/if}

				<div>
					<button
						type="submit"
						class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Send Magic Link
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
