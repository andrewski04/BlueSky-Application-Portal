<script lang="ts">
	import type { FormSection } from '@prisma/client';

	export let section: FormSection | null | undefined;
</script>

{#if section}
	<div>
		<h3>{section.name}</h3>
		{#if section.description}
			<p>{section.description}</p>
		{/if}
		<slot />
	</div>
{:else}
	<p>Section data not available.</p>
{/if}
