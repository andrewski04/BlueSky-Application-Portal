<script lang="ts">
	import type { PageData } from './$types';
	import NavBar from '$lib/components/dashboard/NavBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>

<div class="bg-secondary min-h-screen">
	<NavBar message={`TO BE IMPLEMENTED`}>
		<a href="/admin/dashboard" class=" hover:font-bold">Forms</a>
		<a href="/admin/submissions" class="hover:font-bold">Submissions</a>
		<a href="/admin/users" class="hover:font-bold">Users</a>
		<a href="/admin/settings" class="underline hover:font-bold">Settings</a>
	</NavBar>

	<h1 class="text-center text-2xl font-bold">To be implemented</h1>
</div>
