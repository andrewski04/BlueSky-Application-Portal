<script lang="ts">
	import '../app.css';
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';

	NProgress.configure({ showSpinner: false });

	beforeNavigate(async () => {
		NProgress.start();
	});

	afterNavigate(async () => {
		NProgress.done();
	});

	let { children } = $props();
</script>

{@render children()}
