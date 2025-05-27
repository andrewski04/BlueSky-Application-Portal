<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	let { data }: { data: PageData } = $props();

	let { user } = data;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`Welcome, ${user.firstName}!`} />

	<div class="flex flex-col items-center p-4">
		<div class="w-full max-w-5xl rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
			<p class="mb-4 text-sm text-gray-600">
				This will later contain a summary of information useful to admins (such as new submissions,
				etc.) and quick links to important pages.
			</p>
		</div>
	</div>
</div>
