import { writable } from 'svelte/store';

interface ConfirmModalState {
	isOpen: boolean;
	message: string;
	title: string;
	confirmMsg: string;
	cancelMsg: string;
	resolve: (value: boolean) => void;
}

function createConfirmModalStore() {
	const { subscribe, set, update } = writable<ConfirmModalState>({
		isOpen: false,
		message: '',
		title: 'Confirm',
		confirmMsg: 'Confirm',
		cancelMsg: 'Cancel',
		resolve: () => {}
	});

	return {
		subscribe,
		open: (
			message: string,
			confirmMsg: string = 'Confirm',
			cancelMsg: string = 'Cancel',
			title: string = 'Confirm'
		): Promise<boolean> => {
			return new Promise((resolve) => {
				set({
					isOpen: true,
					message,
					title,
					confirmMsg,
					cancelMsg,
					resolve
				});
			});
		},
		confirm: () => {
			update((state) => {
				state.resolve(true);
				return { ...state, isOpen: false };
			});
		},
		cancel: () => {
			update((state) => {
				state.resolve(false);
				return { ...state, isOpen: false };
			});
		}
	};
}

export const confirmModalStore = createConfirmModalStore();

/**
 * Custom confirmation dialog that works like window.confirm but with a styled modal
 * @param message - The message to display
 * @param confirmMsg - Text for the confirm button (default: "Confirm")
 * @param cancelMsg - Text for the cancel button (default: "Cancel")
 * @param title - Text for the title of the modal (default: "Confirm")
 * @returns Promise<boolean> - true if confirmed, false if cancelled
 */
export async function confirm(
	message: string,
	confirmMsg: string = 'Confirm',
	cancelMsg: string = 'Cancel',
	title: string = 'Confirm'
): Promise<boolean> {
	return confirmModalStore.open(message, confirmMsg, cancelMsg, title);
}
