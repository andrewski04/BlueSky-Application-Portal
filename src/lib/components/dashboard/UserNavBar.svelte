<script lang="ts">
	import NavBar from '$lib/components/dashboard/NavBar.svelte';
	import HomeIcon from '$lib/components/icons/HomeIcon.svelte';
	import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
	import LogoutIcon from '$lib/components/icons/LogoutIcon.svelte';
	let { message } = $props();

	const buttons = [
		{
			label: 'Home',
			href: '/user/dashboard',
			icon: HomeIcon
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: SettingsIcon
		}
	];
</script>

<NavBar {message} {buttons} />
