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

	function getQuestionData() {
		return question.questionDraft || question.questionVersion;
	}

	function needsOptions(type: string): boolean {
		return ['MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX'].includes(type);
	}
	function needsLengthValidation(type: string): boolean {
		return ['TEXT', 'PARAGRAPH'].includes(type);
	}
	function needsNumberValidation(type: string): boolean {
		return type === 'NUMBER';
	}
	function needsDateValidation(type: string): boolean {
		return type === 'DATE';
	}
	function needsFileValidation(type: string): boolean {
		return type === 'FILE_UPLOAD';
	}

	function formatDate(date: Date | string | null | undefined): string {
		if (!date) return '';
		const d = typeof date === 'string' ? new Date(date) : date;
		if (isNaN(d.getTime())) return '';
		return d.toLocaleDateString();
	}
</script>

<div
	tabindex="0"
	role="button"
	class="mt-4 w-full rounded-lg border bg-white p-4 shadow-sm transition-colors outline-none hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 {isSelected
		? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
		: 'border-gray-200'}"
	onclick={() => onSelect?.(question)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect?.(question);
		}
	}}
>
	{#if question.questionDraft || question.questionVersion}
		{#if question.questionVersion}
			<Tooltip
				tip="Library questions cannot be edited directly within a form. See Question Library page for more information."
				right
			>
				<p class="mb-2 text-xs text-gray-700">Library Question ⓘ</p>
			</Tooltip>
		{/if}
		<div class="mb-2 flex items-start justify-between">
			<div class="min-w-0 flex-1">
				<p class="flex items-center gap-2 truncate text-lg font-semibold text-gray-900">
					{getQuestionData().prompt}
					<Tooltip tip="Required" top>
						<span class="text-base text-red-600">{question.required ? '*' : ''}</span>
					</Tooltip>
				</p>
			</div>
			{#if onDelete}
				<button
					onclick={(e) => {
						e.stopPropagation();
						onDelete(question);
					}}
					class="ml-2 rounded px-2 py-1 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-300 focus:outline-none"
					title="Delete question"
				>
					×
				</button>
			{/if}
		</div>

		<p class="mb-2 text-sm text-gray-600">{QuestionTypeMap[getQuestionData().type]}</p>

		{#if needsOptions(getQuestionData().type) && getQuestionData().options.length > 0}
			<div class="mb-2">
				<p class="mb-1 text-xs font-bold text-gray-700 underline">Options</p>
				<ul class="list-inside list-disc space-y-0.5">
					{#each getQuestionData().options as option}
						<li class="text-sm text-gray-800">{option.text}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Validation requirements -->
		{#if needsLengthValidation(getQuestionData().type) && (getQuestionData().minLength != null || getQuestionData().maxLength != null)}
			<div class="mb-1 flex gap-4 text-xs text-gray-700">
				{#if getQuestionData().minLength != null}
					<span>Min Length: <span class="font-semibold">{getQuestionData().minLength}</span></span>
				{/if}
				{#if getQuestionData().maxLength != null}
					<span>Max Length: <span class="font-semibold">{getQuestionData().maxLength}</span></span>
				{/if}
			</div>
		{/if}
		{#if needsNumberValidation(getQuestionData().type) && (getQuestionData().minValue != null || getQuestionData().maxValue != null)}
			<div class="mb-1 flex gap-4 text-xs text-gray-700">
				{#if getQuestionData().minValue != null}
					<span>Min Value: <span class="font-semibold">{getQuestionData().minValue}</span></span>
				{/if}
				{#if getQuestionData().maxValue != null}
					<span>Max Value: <span class="font-semibold">{getQuestionData().maxValue}</span></span>
				{/if}
			</div>
		{/if}
		{#if needsDateValidation(getQuestionData().type) && (getQuestionData().minDate != null || getQuestionData().maxDate != null)}
			<div class="mb-1 flex gap-4 text-xs text-gray-700">
				{#if getQuestionData().minDate != null}
					<span>
						Min Date: <span class="font-semibold">{formatDate(getQuestionData().minDate)}</span>
					</span>
				{/if}
				{#if getQuestionData().maxDate != null}
					<span>
						Max Date: <span class="font-semibold">{formatDate(getQuestionData().maxDate)}</span>
					</span>
				{/if}
			</div>
		{/if}
		{#if needsFileValidation(getQuestionData().type) && (getQuestionData().acceptedTypes || getQuestionData().maxFileSizeBytes != null)}
			<div class="mb-1 flex gap-4 text-xs text-gray-700">
				{#if getQuestionData().acceptedTypes}
					<span
						>Accepted Types: <span class="font-semibold">{getQuestionData().acceptedTypes}</span
						></span
					>
				{/if}
				{#if getQuestionData().maxFileSizeBytes != null}
					<span
						>Max File Size: <span class="font-semibold"
							>{Math.floor((getQuestionData().maxFileSizeBytes ?? 0) / (1024 * 1024))} MB</span
						></span
					>
				{/if}
			</div>
		{/if}
	{/if}
</div>
