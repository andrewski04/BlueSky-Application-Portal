<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { user } = data;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div>
	<h1 class="text-3xl font-bold">Welcome admin, {user.firstName}!</h1>

	<a href="/auth/logout" class="btn btn-danger p-2 py-1">Logout</a>
</div>
