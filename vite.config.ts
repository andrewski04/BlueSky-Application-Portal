import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		allowedHosts: ['localhost', 'host.docker.internal']
	},
	test: {
		environment: 'node',
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.{ts,js}'],
			exclude: [
				'src/**/*.{test,spec}.{js,ts}',
				'src/**/*.d.ts',
				'src/**/_*.{js,ts}',
				'src/routes/**/*.{js,ts}'
			]
		}
	}
});
