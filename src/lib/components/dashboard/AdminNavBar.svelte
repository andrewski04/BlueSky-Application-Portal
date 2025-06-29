<script lang="ts">
	import NavBar from '$lib/components/dashboard/NavBar.svelte';
	import { page } from '$app/state';

	let props = $props();
	let { message } = props;

	function isActive(path: string): boolean {
		return page.url.pathname.startsWith(path);
	}
</script>

<NavBar {message}>
	<a
		href="/admin/dashboard"
		class="{isActive('/admin/dashboard') ? 'font-bold underline' : ''} hover:font-bold">Dashboard</a
	>
	<a
		href="/admin/form-drafts"
		class="{isActive('/admin/form-drafts') ? 'font-bold underline' : ''} hover:font-bold"
		>Form Drafts</a
	>
	<a
		href="/admin/published-forms"
		class="{isActive('/admin/published-forms') ? 'font-bold underline' : ''} hover:font-bold"
		>Published Forms</a
	>
	<a
		href="/admin/submissions"
		class="{isActive('/admin/submissions') ? 'font-bold underline' : ''} hover:font-bold"
		>Submissions</a
	>
	<a
		href="/admin/announcements"
		class="{isActive('/admin/announcements') ? 'font-bold underline' : ''} hover:font-bold"
		>Announcements</a
	>
	<a
		href="/admin/users"
		class="{isActive('/admin/users') ? 'font-bold underline' : ''} hover:font-bold">Users</a
	>
	<a
		href="/admin/settings"
		class="{isActive('/admin/settings') ? 'font-bold underline' : ''} hover:font-bold">Settings</a
	>
</NavBar>
