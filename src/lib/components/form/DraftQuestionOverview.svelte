<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { QuestionTypeMap } from '$lib/utils/QuestionTypeMap';
	import Tooltip from '$lib/components/util/Tooltip.svelte';

	type FormQuestion = Prisma.QuestionLinkDraftGetPayload<{
		include: {
			questionDraft: { include: { options: { include: { questionOptionGroup: true } } } };
			questionVersion: { include: { options: { include: { questionOptionGroup: true } } } };
		};
	}>;

	let {
		question,
		isSelected,
		onSelect,
		onDelete,
		hideLibrary = false,
		hideDragHandle = false
	}: {
		question: FormQuestion;
		isSelected?: boolean;
		onSelect?: (question: FormQuestion) => void;
		onDelete?: (question: FormQuestion) => void;
		hideLibrary?: boolean;
		hideDragHandle?: boolean;
	} = $props();

	function getQuestionData() {
		const questionData = question.questionDraft || question.questionVersion;
		const groupSet = new Set<string>();
		const optionSet = new Set<string>();

		for (const opt of questionData.options) {
			if (opt.questionOptionGroup?.text) {
				groupSet.add(opt.questionOptionGroup.text);
			}
			optionSet.add(opt.text);
		}

		return {
			...questionData,
			optionGroups: Array.from(groupSet),
			options: Array.from(optionSet)
		};
	}

	function needsOptions(type: string): boolean {
		return ['MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX'].includes(type);
	}

	function needsOptionGroups(type: string): boolean {
		return ['MULTIPLE_CHOICE_GRID', 'CHECKBOX_GRID'].includes(type);
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
	class="group w-full rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 outline-none {isSelected
		? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200 '
		: 'border-gray-200'} {onSelect ? 'hover:bg-blue-50 hover:shadow-md' : 'pointer-events-none'}"
	tabindex="0"
	role="button"
	onclick={() => onSelect?.(question)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect?.(question);
		}
	}}
>
	{#if question.questionDraft || question.questionVersion}
		<!-- Header Section -->
		<div class="mb-4">
			{#if question.questionVersion && !hideLibrary}
				<div class="mb-3">
					<Tooltip
						tip="Library questions cannot be edited directly within a form. See Question Library page for more information."
						right
					>
						<span
							class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700"
						>
							Library Question
							<span class="text-purple-500">ⓘ</span>
						</span>
					</Tooltip>
				</div>
			{/if}

			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 text-lg leading-tight font-semibold text-gray-900">
						{#if !hideDragHandle}
							<div class="question-drag-handle text-gray-400">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M5 10H19M14 19L12 21L10 19M14 5L12 3L10 5M5 14H19"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						{/if}
						<h3>
							{getQuestionData().prompt}
							{#if question.required}
								<span class="inline font-bold text-red-600">*</span>
							{/if}
						</h3>
					</div>
				</div>
				{#if onDelete}
					<button
						aria-label="Delete question"
						onclick={(e) => {
							e.stopPropagation();
							onDelete(question);
						}}
						class="rounded-full p-2 text-red-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-100 focus:ring-2 focus:ring-red-300 focus:outline-none"
						title="Delete question"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Question Type Badge -->
		<div class="mb-4">
			<span
				class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
			>
				{QuestionTypeMap[getQuestionData().type]}
			</span>
		</div>

		<!-- Options Section -->
		{#if needsOptions(getQuestionData().type) && getQuestionData().options.length > 0}
			<div class="mb-4">
				<h4 class="mb-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">Options</h4>
				<div class="space-y-1">
					{#each getQuestionData().options as option, index}
						<div class="flex items-center gap-2 rounded bg-gray-50 px-3 py-2">
							<span
								class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
							>
								{index + 1}
							</span>
							<span class="text-sm text-gray-800">{option}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if needsOptionGroups(getQuestionData().type) && getQuestionData().options.length > 0}
			<div class="">
				<table class="w-full table-fixed">
					<thead>
						<tr class="border-b border-gray-300 pb-3">
							<th class=" pb-3 text-left"></th>
							{#each getQuestionData().options as option}
								<th class="truncate px-4 pb-3 text-center text-xs font-medium text-gray-600">
									{option}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each getQuestionData().optionGroups as optionGroup}
							<tr class="transition-colors hover:bg-white">
								<td class="truncate py-2 pr-4 text-sm font-medium text-gray-700">
									{optionGroup}
								</td>
								{#each getQuestionData().options as option, index}
									<td class="px-2 py-2 text-center">
										<span
											class="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
										>
											{index + 1}
										</span>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Validation Requirements -->
		{#if needsLengthValidation(getQuestionData().type) && (getQuestionData().minLength != null || getQuestionData().maxLength != null)}
			<div class="mb-3">
				<h4 class="mb-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
					Length Requirements
				</h4>
				<div class="flex flex-wrap gap-3">
					{#if getQuestionData().minLength != null}
						<span
							class="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
						>
							Min: {getQuestionData().minLength}
						</span>
					{/if}
					{#if getQuestionData().maxLength != null}
						<span
							class="inline-flex items-center rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800"
						>
							Max: {getQuestionData().maxLength}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		{#if needsNumberValidation(getQuestionData().type) && (getQuestionData().minValue != null || getQuestionData().maxValue != null)}
			<div class="mb-3">
				<h4 class="mb-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
					Number Range
				</h4>
				<div class="flex flex-wrap gap-3">
					{#if getQuestionData().minValue != null}
						<span
							class="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
						>
							Min: {getQuestionData().minValue}
						</span>
					{/if}
					{#if getQuestionData().maxValue != null}
						<span
							class="inline-flex items-center rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800"
						>
							Max: {getQuestionData().maxValue}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		{#if needsDateValidation(getQuestionData().type) && (getQuestionData().minDate != null || getQuestionData().maxDate != null)}
			<div class="mb-3">
				<h4 class="mb-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">Date Range</h4>
				<div class="flex flex-wrap gap-3">
					{#if getQuestionData().minDate != null}
						<span
							class="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
						>
							From: {formatDate(getQuestionData().minDate)}
						</span>
					{/if}
					{#if getQuestionData().maxDate != null}
						<span
							class="inline-flex items-center rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800"
						>
							To: {formatDate(getQuestionData().maxDate)}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		{#if needsFileValidation(getQuestionData().type) && (getQuestionData().acceptedTypes || getQuestionData().maxFileSizeBytes != null)}
			<div class="mb-3">
				<h4 class="mb-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
					File Requirements
				</h4>
				<div class="space-y-2">
					{#if getQuestionData().acceptedTypes}
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-gray-600">Types:</span>
							<span
								class="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
							>
								{getQuestionData().acceptedTypes}
							</span>
						</div>
					{/if}
					{#if getQuestionData().maxFileSizeBytes != null}
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-gray-600">Max Size:</span>
							<span
								class="inline-flex items-center rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800"
							>
								{Math.floor((getQuestionData().maxFileSizeBytes ?? 0) / (1024 * 1024))} MB
							</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>
