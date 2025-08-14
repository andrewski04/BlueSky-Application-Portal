<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { confirmModalStore } from '$lib/utils/confirmModal';

	const { isOpen, message, confirmMsg, cancelMsg, title } = $derived($confirmModalStore);

	function handleConfirm() {
		confirmModalStore.confirm();
	}

	function handleCancel() {
		confirmModalStore.cancel();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		} else if (event.key === 'Enter') {
			handleConfirm();
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		transition:fade={{ duration: 200 }}
		class="body-overflow-hidden fixed inset-0 z-50 bg-black/50"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-modal-title"
		aria-describedby="confirm-modal-message"
	>
		<!-- Modal -->
		<div
			transition:fly={{ y: -20, duration: 300 }}
			class=" fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform"
		>
			<div class="mx-4 overflow-hidden rounded-xl bg-white shadow-2xl">
				<!-- Header -->
				<div class="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-4">
					<h2 id="confirm-modal-title" class="text-lg font-semibold text-white">{title}</h2>
				</div>

				<!-- Content -->
				<div class="px-6 py-6">
					<p id="confirm-modal-message" class="mb-6 text-base leading-relaxed text-gray-700">
						{message}
					</p>

					<!-- Buttons -->
					<div class="flex space-x-3">
						<button
							type="button"
							onclick={handleCancel}
							class="btn-red flex-1 px-4 py-2.5 text-sm font-medium"
						>
							{cancelMsg}
						</button>
						<button
							type="button"
							onclick={handleConfirm}
							class="btn-blue flex-1 px-4 py-2.5 text-sm font-medium"
						>
							{confirmMsg}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
