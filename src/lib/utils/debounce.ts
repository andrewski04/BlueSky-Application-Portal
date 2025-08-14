/**
 * Creates a debounced version of a function that delays its execution.
 *
 * @param fn The function to debounce
 * @param ms The delay in milliseconds (default: 1000)
 * @returns A new function that will only execute after the specified delay
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...a: any[]) => void>(fn: T, ms = 1000) {
	let timer: ReturnType<typeof setTimeout>;
	// Handle negative delays by defaulting to 1000ms
	const delay = ms < 0 ? 1000 : ms;

	return function (this: any, ...args: Parameters<T>) {
		clearTimeout(timer);
		if (delay === 0) {
			// Execute immediately for 0ms delay
			fn.apply(this, args);
		} else {
			timer = setTimeout(() => fn.apply(this, args), delay);
		}
	};
}
