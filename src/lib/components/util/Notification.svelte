<!-- This component is the visual representation of a single notification. -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { NotifType } from '$lib/utils/notify';

	export let type: NotifType = 'info';
	export let message: string;
	export let onclose: () => void;

	// --- Configuration for different Notif types ---
	const typeConfig = {
		info: {
			bg: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700',
			icon: `M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z`
		},
		success: {
			bg: 'bg-gradient-to-r from-green-500 via-green-600 to-green-700',
			icon: `M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`
		},
		warning: {
			bg: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
			icon: `M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z`
		},
		error: {
			bg: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700',
			icon: `M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z`
		}
	};

	const config = typeConfig[type];
</script>

<div
	transition:fly={{ y: -30, duration: 300 }}
	class="mb-4 flex w-full max-w-sm items-center space-x-4 overflow-hidden rounded-lg border-0 text-white {config.bg}"
	role="alert"
>
	<!-- Icon -->
	<div class="p-4">
		<svg
			class="h-6 w-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={config.icon}></path>
		</svg>
	</div>

	<!-- Message -->
	<div class="flex-1 py-4 text-sm font-semibold">{message}</div>

	<!-- Close Button -->
	<button
		on:click={onclose}
		class="rounded-lg p-4 transition-all duration-200 hover:scale-150"
		aria-label="Close"
	>
		<svg
			class="h-5 w-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
			></path>
		</svg>
	</button>
</div>
