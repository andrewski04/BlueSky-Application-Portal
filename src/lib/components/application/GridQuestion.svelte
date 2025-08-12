<script lang="ts">
	import type { QuestionVersion, QuestionOption, QuestionOptionGroup } from '@prisma/client';

	type QuestionOptionWithGroup = QuestionOption & {
		questionOptionGroup: QuestionOptionGroup | null;
	};
	let {
		question,
		required,
		existingAnswer,
		value = $bindable(existingAnswer ?? []),
		onchange,
		readonly = false
	}: {
		question: QuestionVersion & { options: QuestionOptionWithGroup[] };
		required: boolean;
		existingAnswer: string[] | null | undefined;
		value?: string[];
		onchange?: (value: string[]) => void;
		readonly?: boolean;
	} = $props();

	$effect(() => {
		if (onchange) {
			onchange(value);
		}
	});

	// Get unique option texts (these will be the column headers)
	const optionTexts = $derived.by(() => {
		const optionSet = new Set<string>();
		for (const opt of question.options.sort((a, b) => a.displayOrder - b.displayOrder)) {
			optionSet.add(opt.text);
		}
		return Array.from(optionSet);
	});

	// Group options by their group (these will be the row headers)
	const optionsByGroup = $derived.by(() => {
		const groups = new Map<string, QuestionOptionWithGroup[]>();

		for (const opt of question.options) {
			if (opt.questionOptionGroup) {
				const groupText = opt.questionOptionGroup.text;
				if (!groups.has(groupText)) {
					groups.set(groupText, []);
				}
				groups.get(groupText)!.push(opt);
			}
		}

		// Sort groups by display order and return as array of objects for easier iteration
		return Array.from(groups.entries())
			.map(([groupText, options]) => ({
				groupText,
				options,
				displayOrder: options[0]?.questionOptionGroup?.displayOrder ?? 0
			}))
			.sort((a, b) => a.displayOrder - b.displayOrder);
	});

	// Helper function to find the option ID for a specific group and option text
	function findOptionId(groupText: string, optionText: string): string | null {
		const groupOptions = optionsByGroup.find((group) => group.groupText === groupText)?.options;
		if (!groupOptions) {
			return null;
		}

		const option = groupOptions.find((opt) => opt.text === optionText);

		return option?.id ?? null;
	}

	// Handle radio button selection for MULTIPLE_CHOICE_GRID
	function handleRadioChange(groupText: string, optionId: string) {
		if (question.type === 'MULTIPLE_CHOICE_GRID') {
			// Remove any existing selection for this group
			const newValue = value.filter((id) => {
				const option = question.options.find((opt) => opt.id === id);
				return option?.questionOptionGroup?.text !== groupText;
			});
			// Add the new selection
			newValue.push(optionId);
			value = newValue;
		}
	}
</script>

<div>
	<fieldset>
		<legend class="mb-2 block text-lg font-bold text-black">
			{question.prompt}
			{#if required}<span class="text-red-500">*</span>{/if}
		</legend>

		<div class="space-y-2">
			<div class="">
				<table class="w-full table-fixed">
					<thead>
						<tr class="border-b border-gray-300 pb-3">
							<th class="pb-3 text-left"></th>
							{#each optionTexts as optionText}
								<th class="truncate px-4 pb-3 text-center text-xs font-medium text-gray-600">
									{optionText}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each optionsByGroup as group}
							<tr class="transition-colors hover:bg-white">
								<td class="truncate py-2 pr-4 text-sm font-medium text-gray-700">
									{group.groupText}
								</td>
								{#each optionTexts as optionText}
									{@const optionId = findOptionId(group.groupText, optionText)}

									<td class="px-2 py-2 text-center">
										{#if optionId}
											{#if question.type === 'MULTIPLE_CHOICE_GRID'}
												<input
													type="radio"
													id="{question.id}-{optionId}"
													name="{question.id}-{group.groupText}"
													value={optionId}
													checked={value.includes(optionId)}
													onchange={() => handleRadioChange(group.groupText, optionId)}
													disabled={readonly}
													class="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
												/>
											{:else}
												<input
													type="checkbox"
													id="{question.id}-{optionId}"
													name={question.id}
													value={optionId}
													bind:group={value}
													disabled={readonly}
													class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
												/>
											{/if}
										{:else}
											<span class="text-gray-300">-</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</fieldset>
</div>
