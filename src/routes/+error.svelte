<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error {page.status}</title>
	<style>
		.error-div {
			background: linear-gradient(
				135deg,
				rgb(253, 94, 94) 0%,
				rgba(220, 38, 38, 1) 50%,
				rgb(180, 20, 20) 100%
			);
			box-shadow:
				0 12px 40px rgba(239, 68, 68, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	</style>
</svelte:head>

<div class="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-gray-300 p-8">
	<div class="error-div flex flex-col items-center justify-center rounded-lg p-12">
		<h1 class="mb-6 text-center text-6xl font-bold text-white">
			Error {page.status}
		</h1>
		<p class="mb-6 text-center text-2xl text-white">
			{page.error?.message}
		</p>
		<div class="flex flex-row items-center justify-center gap-4">
			<button onclick={() => history.back()} class="btn-green cursor-pointer text-2xl text-white">
				Back
			</button>
			<a href="/" class="btn-blue text-2xl text-white">Home</a>
		</div>
	</div>
</div>
