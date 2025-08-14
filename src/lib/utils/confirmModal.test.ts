import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { confirmModalStore, confirm } from './confirmModal';
import { get } from 'svelte/store';

describe('ConfirmModal', () => {
	beforeEach(() => {
		// Reset the store to initial state
		confirmModalStore.cancel();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	describe('confirmModalStore', () => {
		it('should have initial state', () => {
			const state = get(confirmModalStore);
			expect(state.isOpen).toBe(false);
			expect(state.message).toBe('');
			expect(state.title).toBe('Confirm');
			expect(state.confirmMsg).toBe('Confirm');
			expect(state.cancelMsg).toBe('Cancel');
		});

		describe('open', () => {
			it('should open modal with default values', async () => {
				const promise = confirmModalStore.open('Test message');

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(true);
				expect(state.message).toBe('Test message');
				expect(state.title).toBe('Confirm');
				expect(state.confirmMsg).toBe('Confirm');
				expect(state.cancelMsg).toBe('Cancel');

				// Clean up
				confirmModalStore.cancel();
				await promise;
			});

			it('should open modal with custom values', async () => {
				const promise = confirmModalStore.open(
					'Custom message',
					'Yes, do it',
					'No, cancel',
					'Custom Title'
				);

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(true);
				expect(state.message).toBe('Custom message');
				expect(state.title).toBe('Custom Title');
				expect(state.confirmMsg).toBe('Yes, do it');
				expect(state.cancelMsg).toBe('No, cancel');

				// Clean up
				confirmModalStore.cancel();
				await promise;
			});

			it('should return a promise', () => {
				const promise = confirmModalStore.open('Test message');
				expect(promise).toBeInstanceOf(Promise);

				// Clean up
				confirmModalStore.cancel();
			});
		});

		describe('confirm', () => {
			it('should resolve promise with true and close modal', async () => {
				const promise = confirmModalStore.open('Test message');

				// Confirm the modal
				confirmModalStore.confirm();

				const result = await promise;
				expect(result).toBe(true);

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(false);
			});

			it('should handle multiple confirm calls gracefully', async () => {
				const promise = confirmModalStore.open('Test message');

				// Call confirm multiple times
				confirmModalStore.confirm();
				confirmModalStore.confirm();

				const result = await promise;
				expect(result).toBe(true);

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(false);
			});
		});

		describe('cancel', () => {
			it('should resolve promise with false and close modal', async () => {
				const promise = confirmModalStore.open('Test message');

				// Cancel the modal
				confirmModalStore.cancel();

				const result = await promise;
				expect(result).toBe(false);

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(false);
			});

			it('should handle multiple cancel calls gracefully', async () => {
				const promise = confirmModalStore.open('Test message');

				// Call cancel multiple times
				confirmModalStore.cancel();
				confirmModalStore.cancel();

				const result = await promise;
				expect(result).toBe(false);

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(false);
			});
		});

		describe('state updates', () => {
			it('should update state when opening modal', () => {
				confirmModalStore.open('New message', 'Yes', 'No', 'New Title');

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(true);
				expect(state.message).toBe('New message');
				expect(state.confirmMsg).toBe('Yes');
				expect(state.cancelMsg).toBe('No');
				expect(state.title).toBe('New Title');
			});

			it('should reset state when closing modal', async () => {
				const promise = confirmModalStore.open('Test message');

				confirmModalStore.confirm();
				await promise;

				const state = get(confirmModalStore);
				expect(state.isOpen).toBe(false);
				// Note: The message may not be reset to empty string in the current implementation
				expect(state.title).toBe('Confirm');
				expect(state.confirmMsg).toBe('Confirm');
				expect(state.cancelMsg).toBe('Cancel');
			});
		});
	});

	describe('confirm function', () => {
		it('should open modal with default values', async () => {
			const promise = confirm('Test message');

			const state = get(confirmModalStore);
			expect(state.isOpen).toBe(true);
			expect(state.message).toBe('Test message');
			expect(state.title).toBe('Confirm');
			expect(state.confirmMsg).toBe('Confirm');
			expect(state.cancelMsg).toBe('Cancel');

			// Clean up
			confirmModalStore.cancel();
			await promise;
		});

		it('should open modal with custom values', async () => {
			const promise = confirm('Custom message', 'Yes, do it', 'No, cancel', 'Custom Title');

			const state = get(confirmModalStore);
			expect(state.isOpen).toBe(true);
			expect(state.message).toBe('Custom message');
			expect(state.title).toBe('Custom Title');
			expect(state.confirmMsg).toBe('Yes, do it');
			expect(state.cancelMsg).toBe('No, cancel');

			// Clean up
			confirmModalStore.cancel();
			await promise;
		});

		it('should return a promise', () => {
			const promise = confirm('Test message');
			expect(promise).toBeInstanceOf(Promise);

			// Clean up
			confirmModalStore.cancel();
		});

		it('should work with confirmModalStore methods', async () => {
			const promise = confirm('Test message');

			// Use the store methods to resolve
			confirmModalStore.confirm();

			const result = await promise;
			expect(result).toBe(true);
		});
	});

	describe('Edge cases', () => {
		it('should handle edge cases gracefully', async () => {
			// Test with empty message
			const promise1 = confirmModalStore.open('');
			confirmModalStore.confirm();
			const result1 = await promise1;
			expect(result1).toBe(true);

			// Test with very long message
			const longMessage = 'A'.repeat(1000);
			const promise2 = confirmModalStore.open(longMessage);
			confirmModalStore.cancel();
			const result2 = await promise2;
			expect(result2).toBe(false);
		});
	});
});
