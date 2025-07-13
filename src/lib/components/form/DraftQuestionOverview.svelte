<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	type FormQuestion = Prisma.QuestionLinkDraftGetPayload<{
		include: {
			questionDraft: { include: { options: true } };
			questionVersion: { include: { options: true } };
		};
	}>;

	let {
		question,
		isSelected,
		onSelect,
		onDelete
	}: {
		question: FormQuestion;
		isSelected?: boolean;
		onSelect?: (question: FormQuestion) => void;
		onDelete?: (question: FormQuestion) => void;
	} = $props();
</script>

<div
	class="mt-4 cursor-pointer rounded border p-3 transition-colors hover:bg-gray-50 {isSelected
		? 'border-blue-500 bg-blue-50'
		: 'border-gray-200'}"
	onclick={() => onSelect?.(question)}
>
	{#if question.questionDraft}
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<p class="font-bold">
					{question.questionDraft.prompt}
					<Tooltip tip="Required" top>
						<span class="text-red-600">{question.required ? '*' : ''}</span>
					</Tooltip>
				</p>
			</div>
			{#if onDelete}
				<button
					onclick={(e) => {
						e.stopPropagation();
						onDelete(question);
					}}
					class="ml-2 rounded px-2 py-1 text-red-600 hover:bg-red-100"
					title="Delete question"
				>
					×
				</button>
			{/if}
		</div>

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
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<p class="font-bold">
					{question.questionVersion.prompt}
					<Tooltip tip="Required" top>
						<span class="text-red-600">{question.required ? '*' : ''}</span>
					</Tooltip>
				</p>
			</div>
			{#if onDelete}
				<button
					onclick={(e) => {
						e.stopPropagation();
						onDelete(question);
					}}
					class="ml-2 rounded px-2 py-1 text-red-600 hover:bg-red-100"
					title="Delete question"
				>
					×
				</button>
			{/if}
		</div>
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
</div>
