import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Notifs, addNotif, removeNotif, resetNotifications, type NotifType } from './notify';
import { get } from 'svelte/store';

describe('Notification System', () => {
	beforeEach(() => {
		// Reset the notification system to initial state
		resetNotifications();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.restoreAllMocks();
	});

	describe('Notifs store', () => {
		it('should have initial empty state', () => {
			const notifications = get(Notifs);
			expect(notifications).toEqual([]);
		});

		it('should be a writable store', () => {
			expect(typeof Notifs.subscribe).toBe('function');
		});
	});

	describe('addNotif', () => {
		it('should add a notification with default values', () => {
			addNotif('Test message');

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(1);
			expect(notifications[0]).toMatchObject({
				message: 'Test message',
				type: 'info',
				duration: 3000
			});
			expect(notifications[0].id).toBeGreaterThan(0);
		});

		it('should add a notification with custom type', () => {
			addNotif('Success message', 'success');

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(1);
			expect(notifications[0]).toMatchObject({
				message: 'Success message',
				type: 'success',
				duration: 3000
			});
		});

		it('should add a notification with custom duration', () => {
			addNotif('Warning message', 'warning', 5000);

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(1);
			expect(notifications[0]).toMatchObject({
				message: 'Warning message',
				type: 'warning',
				duration: 5000
			});
		});

		it('should add a notification with all custom values', () => {
			addNotif('Error message', 'error', 10000);

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(1);
			expect(notifications[0]).toMatchObject({
				message: 'Error message',
				type: 'error',
				duration: 10000
			});
		});

		it('should add notifications to the beginning of the array', () => {
			addNotif('First message');
			addNotif('Second message');

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(2);
			expect(notifications[0].message).toBe('Second message');
			expect(notifications[1].message).toBe('First message');
		});

		it('should generate unique IDs for each notification', () => {
			addNotif('Message 1');
			addNotif('Message 2');
			addNotif('Message 3');

			const notifications = get(Notifs);
			const ids = notifications.map((n) => n.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(3);
			// IDs should be sequential starting from 1
			expect(ids).toEqual([3, 2, 1]); // IDs are incremented and added to beginning
		});

		it('should handle all notification types', () => {
			const types: NotifType[] = ['info', 'success', 'warning', 'error'];

			types.forEach((type) => {
				addNotif(`Test ${type}`, type);
			});

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(4);

			// Check that notifications are added in reverse order (newest first)
			types.reverse().forEach((type, index) => {
				expect(notifications[index].type).toBe(type);
			});
		});

		it('should handle edge cases', () => {
			// Empty message
			addNotif('');
			let notifications = get(Notifs);
			expect(notifications[0].message).toBe('');

			// Very long message
			const longMessage = 'A'.repeat(1000);
			addNotif(longMessage);
			notifications = get(Notifs);
			expect(notifications[0].message).toBe(longMessage);

			// Zero duration
			addNotif('Zero duration', 'info', 0);
			notifications = get(Notifs);
			expect(notifications[0].duration).toBe(0);

			// Negative duration
			addNotif('Negative duration', 'info', -1000);
			notifications = get(Notifs);
			expect(notifications[0].duration).toBe(-1000);
		});
	});

	describe('removeNotif', () => {
		it('should remove notification by ID', () => {
			addNotif('Message 1');
			addNotif('Message 2');
			addNotif('Message 3');

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(3);

			// Remove middle notification
			removeNotif(notifications[1].id);

			notifications = get(Notifs);
			expect(notifications).toHaveLength(2);
			expect(notifications.find((n) => n.id === 2)).toBeUndefined();
		});

		it('should handle removing non-existent notification', () => {
			addNotif('Test message');

			const initialNotifications = get(Notifs);
			expect(initialNotifications).toHaveLength(1);

			removeNotif(999); // Non-existent ID

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(1); // Should remain unchanged
		});

		it('should handle removing from empty array', () => {
			removeNotif(1);
			const notifications = get(Notifs);
			expect(notifications).toEqual([]);
		});

		it('should handle removing multiple notifications', () => {
			addNotif('Message 1');
			addNotif('Message 2');
			addNotif('Message 3');

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(3);

			// Remove first and last
			removeNotif(notifications[0].id);
			removeNotif(notifications[2].id);

			notifications = get(Notifs);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].id).toBe(2);
		});
	});

	describe('Auto-removal timer', () => {
		it('should automatically remove notification after duration', () => {
			vi.useFakeTimers();

			addNotif('Test message', 'info', 1000);

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(1);

			// Advance time by duration
			vi.advanceTimersByTime(1000);

			notifications = get(Notifs);
			expect(notifications).toHaveLength(0);

			vi.useRealTimers();
		});

		it('should handle multiple timers correctly', () => {
			vi.useFakeTimers();

			addNotif('Message 1', 'info', 1000);
			addNotif('Message 2', 'info', 2000);
			addNotif('Message 3', 'info', 3000);

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(3);

			// Advance time by 1000ms - first should be removed
			vi.advanceTimersByTime(1000);
			notifications = get(Notifs);
			expect(notifications).toHaveLength(2);

			// Advance time by 1000ms more - second should be removed
			vi.advanceTimersByTime(1000);
			notifications = get(Notifs);
			expect(notifications).toHaveLength(1);

			// Advance time by 1000ms more - third should be removed
			vi.advanceTimersByTime(1000);
			notifications = get(Notifs);
			expect(notifications).toHaveLength(0);

			vi.useRealTimers();
		});

		it('should handle zero duration notifications', () => {
			vi.useFakeTimers();

			addNotif('Zero duration', 'info', 0);

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(1);

			// Advance time by a small amount
			vi.advanceTimersByTime(100);

			notifications = get(Notifs);
			expect(notifications).toHaveLength(0);

			vi.useRealTimers();
		});

		it('should handle negative duration notifications', () => {
			vi.useFakeTimers();

			addNotif('Negative duration', 'info', -1000);

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(1);

			// Advance time by a small amount
			vi.advanceTimersByTime(100);

			notifications = get(Notifs);
			expect(notifications).toHaveLength(0);

			vi.useRealTimers();
		});
	});

	describe('Notification properties', () => {
		it('should have correct structure', () => {
			addNotif('Test message', 'success', 5000);

			const notifications = get(Notifs);
			expect(notifications).toHaveLength(1);

			const notification = notifications[0];
			expect(notification).toHaveProperty('id');
			expect(notification).toHaveProperty('message');
			expect(notification).toHaveProperty('type');
			expect(notification).toHaveProperty('duration');

			expect(typeof notification.id).toBe('number');
			expect(typeof notification.message).toBe('string');
			expect(typeof notification.type).toBe('string');
			expect(typeof notification.duration).toBe('number');
		});

		it('should validate notification type values', () => {
			const validTypes: NotifType[] = ['info', 'success', 'warning', 'error'];

			validTypes.forEach((type) => {
				addNotif(`Test ${type}`, type);
			});

			const notifications = get(Notifs);
			notifications.forEach((notification) => {
				expect(validTypes).toContain(notification.type);
			});
		});
	});

	describe('Integration scenarios', () => {
		it('should handle rapid addition and removal', () => {
			// Add many notifications rapidly
			for (let i = 0; i < 100; i++) {
				addNotif(`Message ${i}`);
			}

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(100);

			// Remove them rapidly
			notifications.forEach((notification) => {
				removeNotif(notification.id);
			});

			notifications = get(Notifs);
			expect(notifications).toHaveLength(0);
		});

		it('should handle mixed operations', () => {
			vi.useFakeTimers();

			// Add notifications with different durations
			addNotif('Short message', 'info', 1000);
			addNotif('Long message', 'warning', 5000);

			let notifications = get(Notifs);
			expect(notifications).toHaveLength(2);

			// Manually remove one
			removeNotif(notifications[0].id);
			notifications = get(Notifs);
			expect(notifications).toHaveLength(1);

			// Wait for auto-removal of remaining
			vi.advanceTimersByTime(5000);
			notifications = get(Notifs);
			expect(notifications).toHaveLength(0);

			vi.useRealTimers();
		});

		it('should maintain notification order correctly', () => {
			addNotif('First');
			addNotif('Second');
			addNotif('Third');

			let notifications = get(Notifs);
			expect(notifications[0].message).toBe('Third');
			expect(notifications[1].message).toBe('Second');
			expect(notifications[2].message).toBe('First');

			// Remove middle notification
			removeNotif(notifications[1].id);

			notifications = get(Notifs);
			expect(notifications[0].message).toBe('Third');
			expect(notifications[1].message).toBe('First');
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle very long messages', () => {
			const veryLongMessage = 'A'.repeat(10000);
			addNotif(veryLongMessage);

			const notifications = get(Notifs);
			expect(notifications[0].message).toBe(veryLongMessage);
		});

		it('should handle special characters in messages', () => {
			const specialMessage = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
			addNotif(specialMessage);

			const notifications = get(Notifs);
			expect(notifications[0].message).toBe(specialMessage);
		});

		it('should handle unicode characters', () => {
			const unicodeMessage = 'Hello 世界 🌍 🚀';
			addNotif(unicodeMessage);

			const notifications = get(Notifs);
			expect(notifications[0].message).toBe(unicodeMessage);
		});

		it('should handle concurrent operations', () => {
			// Simulate concurrent operations
			const promises = [];

			for (let i = 0; i < 10; i++) {
				promises.push(
					Promise.resolve().then(() => {
						addNotif(`Concurrent ${i}`);
					})
				);
			}

			Promise.all(promises).then(() => {
				const notifications = get(Notifs);
				expect(notifications).toHaveLength(10);
			});
		});
	});
});
