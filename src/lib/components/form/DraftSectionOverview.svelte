<script lang="ts">
	import DraftQuestionOverview from './DraftQuestionOverview.svelte';

	import type { Prisma } from '@prisma/client';

	type FormSectionWithQuestions = Prisma.FormSectionDraftGetPayload<{
		include: {
			questions: {
				include: {
					questionDraft: { include: { options: true } };
					questionVersion: { include: { options: true } };
				};
			};
		};
	}>;

	let { section }: { section: FormSectionWithQuestions } = $props();
</script>

<div class="mb-4 rounded-md bg-white p-4">
	<p class="mb-1 text-2xl font-bold">{section.name}</p>
	<p class="text-md">
		{section.description ? section.description : 'No description provided'}
	</p>
	{#each section.questions as question}
		<DraftQuestionOverview {question} />
	{/each}
</div>
