import { writable } from 'svelte/store';

export type NotifType = 'info' | 'success' | 'warning' | 'error';

export interface Notif {
	id: number;
	message: string;
	type: NotifType;
	duration: number;
}

// Create a writable store with an initial value of an empty array.
// This store will hold all the active Notif notifications.
export const Notifs = writable<Notif[]>([]);
let idCounter = 0;

/**
 * Adds a new notification.
 * @param message The message to display.
 * @param type The type of notification (info, success, warning, error), which controls its color.
 * @param duration The time in milliseconds before the notification automatically disappears.
 */
export function addNotif(message: string, type: NotifType = 'info', duration: number = 3000): void {
	const id = idCounter++;

	// Add the new notification to the beginning of the array
	Notifs.update((all) => [{ id, message, type, duration }, ...all]);

	// Set a timer to automatically remove the notification after its duration
	setTimeout(() => {
		removeNotif(id);
	}, duration);
}

/**
 * Removes a notification by its ID.
 * @param id The unique ID of the notification to remove.
 */
export function removeNotif(id: number): void {
	Notifs.update((all) => all.filter((t) => t.id !== id));
}
