<script lang="ts">
	import type { PageData } from './$types';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';
	let { data }: { data: PageData } = $props();

	let { user } = data;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

