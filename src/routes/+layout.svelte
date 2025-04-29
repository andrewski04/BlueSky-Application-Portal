<script lang="ts">
	import '../app.css';
	import NProgress from 'nprogress';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	//NProgress.configure({ showSpinner: false });

	beforeNavigate(() => {
		NProgress.start();
	});

	afterNavigate(() => {
		NProgress.done();
	});

	let { children } = $props();
</script>

{@render children()}
