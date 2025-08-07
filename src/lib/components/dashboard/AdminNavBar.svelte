<script lang="ts">
	import NavBar from '$lib/components/dashboard/NavBar.svelte';
	import HomeIcon from '$lib/components/icons/HomeIcon.svelte';
	import DocumentIcon from '$lib/components/icons/DocumentIcon.svelte';
	import SubmissionsIcon from '$lib/components/icons/SubmissionsIcon.svelte';
	import AnnouncementsIcon from '$lib/components/icons/AnnouncementsIcon.svelte';
	import UsersIcon from '$lib/components/icons/UsersIcon.svelte';
	import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
	import PublishIcon from '$lib/components/icons/PublishIcon.svelte';
	let { message } = $props();

	const buttons = [
		{
			label: 'Dashboard',
			href: '/admin/dashboard',
			icon: HomeIcon
		},
		{
			label: 'Draft Forms',
			href: '/admin/form-drafts',
			icon: DocumentIcon
		},
		{
			label: 'Published Forms',
			href: '/admin/published-forms',
			icon: PublishIcon
		},
		{
			label: 'Submissions',
			href: '/admin/submissions',
			icon: SubmissionsIcon
		},
		{
			label: 'Announcements',
			href: '/admin/announcements',
			icon: AnnouncementsIcon
		},
		{
			label: 'Users',
			href: '/admin/users',
			icon: UsersIcon
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: SettingsIcon
		}
	];
</script>

<NavBar {message} {buttons} />
