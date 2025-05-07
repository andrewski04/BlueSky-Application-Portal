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
	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), ms);
	};
}
