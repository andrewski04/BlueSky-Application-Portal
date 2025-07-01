<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

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
		{#if question.questionDraft}
			<p class="mt-4 font-bold">
				{question.questionDraft.prompt}
				<Tooltip tip="Required" top>
					<span class="text-red-600">{question.required ? '*' : ''}</span>
				</Tooltip>
			</p>

			<p class="text-sm">
				{QuestionTypeMap[question.questionDraft.type]}
			</p>

			{#if question.questionDraft.options.length > 0}
				<p class="mt-2 text-sm font-bold underline">Options</p>
				{#each question.questionDraft.options as option}
					<p class="text-sm">{option.text}</p>
				{/each}
			{/if}
		{:else if question.questionVersion}
			<p class="mt-4 font-bold">
				{question.questionVersion.prompt}
				<Tooltip tip="Required" top>
					<span class="text-red-600">{question.required ? '*' : ''}</span>
				</Tooltip>
			</p>
			<Tooltip
				tip="Library questions cannot be edited directly within a form. See Question Library page for more information."
				right
			>
				<p class="text-sm text-gray-700">Library Question ⓘ</p>
			</Tooltip>
			<p class="text-sm">
				{QuestionTypeMap[question.questionVersion.type]}
			</p>

			{#if question.questionVersion.options.length > 0}
				<p class="mt-2 text-sm font-bold underline">Options</p>
				{#each question.questionVersion.options as option}
					<p class="text-sm">{option.text}</p>
				{/each}
			{/if}
		{/if}
	{/each}
</div>
