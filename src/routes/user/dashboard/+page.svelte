<script lang="ts">
	import type { PageData } from './$types';
	import NavBar from '$lib/components/dashboard/NavBar.svelte';

	let { data }: { data: PageData } = $props();
	let { user, error, applicationForms, announcements } = data;
</script>

<svelte:head>
	<title>User Dashboard</title>
</svelte:head>

