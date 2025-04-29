import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { dev } from '$app/environment';

// these routes will not be loaded outside of the dev server
// due to the nature of these routes, they should be removed entirely in production
export const load: LayoutServerLoad = (async () => {
	if (!dev) {
		throw redirect(303, '/');
	}

	return {};
}) satisfies LayoutServerLoad;
