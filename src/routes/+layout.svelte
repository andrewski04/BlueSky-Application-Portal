<script lang="ts">
	import '../app.css';
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import Notifier from '$lib/components/util/Notifier.svelte';

	NProgress.configure({ showSpinner: false, parent: '.nprogressbar' });

	beforeNavigate(async () => {
		NProgress.start();
	});

	afterNavigate(async () => {
		NProgress.done();
	});

	let { children } = $props();
</script>

{@render children()}

<Notifier />
