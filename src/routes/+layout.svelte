<script lang="ts">
	import '../app.css';

	/** add loading bar between page loads
	import NProgress from 'nprogress';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	NProgress.configure({ showSpinner: false });

	
	beforeNavigate(() => {
		NProgress.start();
	});

	afterNavigate(() => {
		NProgress.done();
	});
	*/

	let { children } = $props();
</script>

{@render children()}
