<script lang="ts">
	import NavBar from '$lib/components/dashboard/NavBar.svelte';

	let { message } = $props();

	const buttons = [
		{
			label: 'Dashboard',
			href: '/admin/dashboard'
		},
		{
			label: 'Form Drafts',
			href: '/admin/form-drafts'
		},
		{
			label: 'Published Forms',
			href: '/admin/published-forms'
		},
		{
			label: 'Submissions',
			href: '/admin/submissions'
		},
		{
			label: 'Announcements',
			href: '/admin/announcements'
		},
		{
			label: 'Users',
			href: '/admin/users'
		},
		{
			label: 'Settings',
			href: '/settings'
		}
	];
</script>

<NavBar {message} {buttons} />
