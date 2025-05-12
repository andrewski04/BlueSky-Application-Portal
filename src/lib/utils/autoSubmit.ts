/**
 * Automatically saves form data when navigating away from the page and refreshing the page.
 * This is currently not implemented, as it causes issues by rapidly submitting multiple times.
 *
 * @example
 * <form use:autoSubmit />
 *  <...>
 * </form>
 */
export function autoSubmit(node: HTMLFormElement) {
	// save on refresh / external link
	const unload = () => {
		const fd = new FormData(node);
		navigator.sendBeacon(node.action, fd);
	};
	window.addEventListener('beforeunload', unload);

	// cleanup listeners on unmount
	return {
		destroy() {
			window.removeEventListener('beforeunload', unload);
		}
	};
}
