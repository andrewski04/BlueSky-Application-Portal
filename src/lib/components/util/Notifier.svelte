<!-- This component is the container that displays all active toasts. -->
<script lang="ts">
	import { Notifs, removeNotif } from '$lib/utils/notify';
	import Notification from '$lib/components/util/Notification.svelte';
</script>

<div class="fixed right-4 bottom-4 z-50">
	{#each $Notifs as notif (notif.id)}
		<Notification type={notif.type} message={notif.message} onclose={() => removeNotif(notif.id)} />
	{/each}
</div>
