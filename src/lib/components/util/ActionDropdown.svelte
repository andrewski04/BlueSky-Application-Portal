<script lang="ts">
	let {
		actions,
		onAction
	}: {
		actions: Array<{
			label: string;
			action: string;
			icon?: string;
			variant?: 'default' | 'danger' | 'success' | 'warning';
			disabled?: boolean;
		}>;
		onAction: (action: string) => void;
	} = $props();

	let isOpen = $state(false);

	function handleAction(action: string) {
		onAction(action);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown() {
		isOpen = false;
	}

	// Simple click outside handler
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			closeDropdown();
		}
	}

	// Add click listener to document
	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	const variantClasses = {
		default: 'text-gray-700 hover:bg-gray-200',
		danger: 'text-red-700 hover:bg-red-200',
		success: 'text-green-700 hover:bg-green-200',
		warning: 'text-yellow-700 hover:bg-yellow-200'
	};
</script>

<div class="dropdown-container relative inline-block text-left">
	<button
		type="button"
		class="inline-flex items-center justify-center rounded-md border-none p-1 text-sm font-medium text-gray-700 transition-transform duration-200 hover:bg-blue-200 {isOpen
			? 'focus:bg-blue-200 focus:ring-1 focus:ring-blue-500 focus:outline-none'
			: ''} "
		onclick={toggleDropdown}
		aria-expanded={isOpen}
		aria-haspopup="true"
		aria-label="Quick Actions"
	>
		<div class="{isOpen ? 'rotate-180 transform' : ''} transition-transform duration-200">
			<svg
				width="30"
				height="30"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
					fill="currentColor"
				/>
			</svg>
		</div>
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md border-1 border-gray-300 bg-white shadow-lg focus:outline-none"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="menu-button"
			tabindex="-1"
		>
			<div class="py-1" role="none">
				{#each actions as action}
					<button
						type="button"
						class="flex w-full items-center px-4 py-2 text-sm {variantClasses[
							action.variant || 'default'
						]} disabled:cursor-not-allowed disabled:opacity-50"
						role="menuitem"
						tabindex="-1"
						onclick={() => handleAction(action.action)}
						disabled={action.disabled}
					>
						{#if action.icon}
							<img src={action.icon} alt="" class="mr-3 h-4 w-4" />
						{/if}
						{action.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
