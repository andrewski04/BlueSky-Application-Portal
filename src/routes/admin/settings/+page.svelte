<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<AdminNavBar message={`Welcome to the admin dashboard!`} />

	<h1 class="text-center text-2xl font-bold">To be implemented</h1>
</div>
