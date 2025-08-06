<script lang="ts">
	import { TelInput, normalizedCountries, isSelected, clickOutsideAction } from 'svelte-tel-input';
	import type { CountryCode } from 'svelte-tel-input/types';
	import 'svelte-tel-input/styles/flags.css';

	let {
		clickOutside = true,
		closeOnClick = true,
		disabled = false,
		detailedValue = null,
		value = $bindable(null),
		searchPlaceholder = 'Search',
		selectedCountry = $bindable('US' as CountryCode),
		valid = $bindable(true),
		options = { invalidateOnCountryChange: false },
		onChange = $bindable((country: CountryCode) => {}),
		onSame = $bindable((country: CountryCode) => {}),
		inputStyle = ''
	} = $props();

	let searchText = $state('');
	let isOpen = $state(false);

	const focus = (node: HTMLInputElement) => node.focus();

	const selectedCountryDialCode = $derived(
		normalizedCountries.find((el) => el.iso2 === selectedCountry)?.dialCode || null
	);

	const toggleDropDown = (e?: Event) => {
		e?.preventDefault();
		if (disabled) return;
		isOpen = !isOpen;
	};

	const closeDropdown = (e?: Event) => {
		if (isOpen) {
			e?.preventDefault();
			isOpen = false;
			searchText = '';
		}
	};

	const selectClick = () => {
		if (closeOnClick) closeDropdown();
	};

	const closeOnClickOutside = () => {
		if (clickOutside) {
			closeDropdown();
		}
	};

	const sortCountries = (countries: any[], text: string) => {
		const normalizedText = text.trim().toLowerCase();
		const priorityCountries = ['US', 'CA', 'GB'];

		// First filter countries that match the search text
		const filteredCountries = normalizedText
			? countries.filter((country) => {
					const countryNameLower = country.name.toLowerCase();
					return countryNameLower.includes(normalizedText);
				})
			: countries;

		// Then sort the filtered countries
		return [...filteredCountries].sort((a, b) => {
			const aIsPriority = priorityCountries.includes(a.iso2);
			const bIsPriority = priorityCountries.includes(b.iso2);

			// priority countries first
			if (aIsPriority !== bIsPriority) {
				return aIsPriority ? -1 : 1;
			}
			if (aIsPriority && bIsPriority) {
				return priorityCountries.indexOf(a.iso2) - priorityCountries.indexOf(b.iso2);
			}

			if (!normalizedText) {
				return a.label.localeCompare(b.label);
			}

			const aNameLower = a.name.toLowerCase();
			const bNameLower = b.name.toLowerCase();
			const aStartsWith = aNameLower.startsWith(normalizedText);
			const bStartsWith = bNameLower.startsWith(normalizedText);

			if (aStartsWith !== bStartsWith) {
				return aStartsWith ? -1 : 1;
			}

			if (aStartsWith && bStartsWith) {
				return aNameLower.localeCompare(bNameLower);
			}

			return aNameLower.localeCompare(bNameLower);
		});
	};

	const handleSelect = (val: CountryCode, e?: Event) => {
		if (disabled) return;
		e?.preventDefault();
		if (
			selectedCountry === undefined ||
			selectedCountry === null ||
			(typeof selectedCountry === typeof val && selectedCountry !== val)
		) {
			selectedCountry = val;
			onChange(val);
			selectClick();
		} else {
			onSame(val);
			selectClick();
		}
	};

	$effect(() => {
		if (value?.trim().length <= 0) {
			valid = true;
		}
	});
</script>

<div
	class="full-input relative flex h-[50px] rounded-lg {isOpen ? 'rounded-b-none' : ''}   {valid
		? `outline-1 outline-[rgb(59,130,246)]/20 focus-within:outline-[#3b82f6]`
		: ` focus-within:outline-offset-pink-500/50 outline-1 outline-pink-500 focus-within:outline-1 focus-within:outline-offset-1`}"
>
	<div class="flex h-full" use:clickOutsideAction={closeOnClickOutside}>
		<button
			id="states-button"
			data-dropdown-toggle="dropdown-states"
			class="relative z-10 inline-flex h-full flex-shrink-0 items-center overflow-hidden {isOpen
				? 'rounded-b-none'
				: ''} rounded-l-lg border-r-1 border-gray-300 bg-gray-200 px-4 py-3 text-center font-medium whitespace-nowrap text-gray-500 hover:bg-gray-200 focus:outline-none"
			type="button"
			role="combobox"
			aria-controls="dropdown-countries"
			aria-expanded="false"
			aria-haspopup="false"
			onclick={toggleDropDown}
		>
			{#if selectedCountry && selectedCountry !== null}
				<div class="inline-flex items-center text-left">
					<span class="flag flag-{selectedCountry.toLowerCase()} mr-3 flex-shrink-0"></span>
					<span class="text-gray-600">+{selectedCountryDialCode}</span>
				</div>
			{:else}
				Please select
			{/if}
			<svg
				aria-hidden="true"
				class="ml-1 h-4 w-4 {isOpen ? 'rotate-180' : ''}"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
		{#if isOpen}
			<div
				id="dropdown-countries"
				class="dropdown-container absolute z-10 max-w-fit min-w-full translate-y-[51px] divide-y divide-gray-100 overflow-hidden rounded-b-lg bg-white shadow"
				data-popper-reference-hidden=""
				data-popper-escaped=""
				data-popper-placement="bottom"
				aria-orientation="vertical"
				aria-labelledby="country-button"
				tabindex="-1"
			>
				<div
					class="max-h-48 w-full overflow-y-auto text-sm text-gray-700"
					aria-labelledby="countries-button"
					role="listbox"
				>
					<input
						aria-autocomplete="list"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
							}
						}}
						type="text"
						class="sticky top-0 w-full bg-white px-4 py-2 text-gray-900 focus:outline-none"
						bind:value={searchText}
						placeholder={searchPlaceholder}
						use:focus
					/>
					{#each sortCountries(normalizedCountries, searchText) as country (country.id)}
						{@const isActive = isSelected(country.iso2, selectedCountry)}
						<div id="country-{country.iso2}" role="option" aria-selected={isActive}>
							<button
								value={country.iso2}
								type="button"
								class="inline-flex w-full overflow-hidden px-4 py-2 text-sm text-black hover:bg-gray-100
                             active:bg-gray-800
                            {isActive ? 'bg-gray-200' : 'text-gray-400 hover:text-black'}"
								onclick={(e) => {
									handleSelect(country.iso2, e);
								}}
							>
								<div class="inline-flex items-center text-left">
									<span class="flag flag-{country.iso2.toLowerCase()} mr-3 flex-shrink-0"></span>
									<span class="mr-2">{country.name}</span>
									<span class="text-gray-500">+{country.dialCode}</span>
								</div>
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<TelInput
		id="tel-input"
		bind:country={selectedCountry}
		bind:detailedValue
		bind:value
		bind:valid
		{options}
		required={false}
		class="number-input block w-full rounded-r-lg px-4 py-3 focus:outline-none {inputStyle}"
	/>
</div>

<style>
	.number-input {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
		transition: all 0.3s ease;
		backdrop-filter: blur(5px);
	}

	.full-input:focus-within {
		box-shadow:
			0 0 0 3px rgba(59, 130, 246, 0.1),
			0 4px 16px rgba(59, 130, 246, 0.1);
	}

	.dropdown-container {
		outline: 1px solid #3b82f6;
	}
</style>
