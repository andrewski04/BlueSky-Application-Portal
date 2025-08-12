<script lang="ts">
	import { onMount } from 'svelte';

	let {
		options = [],
		value = 'all',
		placeholder = 'Select an option',
		label = '',
		class: classes = 'min-w-[200px]',
		onChange = () => {}
	} = $props<{
		options: Array<{ id: string; name: string; adminName?: string }>;
		value?: string;
		placeholder?: string;
		label?: string;
		class?: string;
		onChange?: (value: string) => void;
	}>();

	let isOpen = $state(false);
	let searchTerm = $state('');
	let filteredOptions = $derived.by(() => {
		if (!searchTerm) return options;
		const term = searchTerm.toLowerCase();
		return options.filter(
			(option: { id: string; name: string; adminName?: string }) =>
				option.name.toLowerCase().includes(term) ||
				(option.adminName && option.adminName.toLowerCase().includes(term))
		);
	});

	let dropdownRef: HTMLDivElement | null = $state(null);
	let searchInputRef: HTMLInputElement | null = $state(null);

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			// Use a slightly longer timeout to ensure the DOM has updated
			setTimeout(() => {
				if (searchInputRef) {
					searchInputRef.focus();
					// Also select all text for easy replacement
					searchInputRef.select();
				}
			}, 10);
		}
	}

	function selectOption(optionId: string) {
		value = optionId;
		isOpen = false;
		searchTerm = '';
		onChange(optionId);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
			searchTerm = '';
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
			searchTerm = '';
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);

		if (isOpen && searchInputRef) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				if (searchInputRef) {
					searchInputRef.focus();
					searchInputRef.select();
				}
			}, 50);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	let selectedOption = $derived(
		options.find((opt: { id: string; name: string; adminName?: string }) => opt.id === value)
	);
</script>

<div class="relative {classes}" bind:this={dropdownRef}>
	{#if label}
		<p class="mb-1 block text-sm font-medium text-gray-700">{label}</p>
	{/if}

	<button
		type="button"
		onclick={toggleDropdown}
		class=" flex w-full cursor-pointer items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
	>
		<span class="truncate">
			{#if selectedOption}
				{selectedOption.name}
				{#if selectedOption.adminName && selectedOption.adminName !== selectedOption.name}
					<span class="ml-2 text-gray-500">({selectedOption.adminName})</span>
				{/if}
			{:else}
				{placeholder}
			{/if}
		</span>
		<svg
			class="ml-2 h-4 w-4 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
		>
			<div class="border-b border-gray-200">
				<input
					bind:this={searchInputRef}
					type="text"
					bind:value={searchTerm}
					placeholder="Search..."
					class="w-full border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>

			<div class="py-1">
				{#each filteredOptions as option}
					<button
						type="button"
						onclick={() => selectOption(option.id)}
						class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none {option.id ===
						value
							? 'bg-blue-50 text-blue-700'
							: 'text-gray-700'}"
					>
						<div class="font-medium">{option.name}</div>
						{#if option.adminName && option.adminName !== option.name}
							<div class="text-xs text-gray-500">{option.adminName}</div>
						{/if}
					</button>
				{/each}

				{#if filteredOptions.length === 0}
					<div class="px-3 py-2 text-sm text-gray-500">No options found</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
