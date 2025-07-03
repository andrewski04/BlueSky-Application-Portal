<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { user } = data;
</script>

<svelte:head>
	<title>User Dashboard</title>
</svelte:head>

<main class="bg-blue-900">
	<header class="flex items-center bg-blue-800 p-4 text-white">
		<div class="flex-grow text-center">
			<h1 class="text-xl font-bold">Welcome! {user.firstName}</h1>
		</div>
	</header>

	<nav class="flex justify-center space-x-6 bg-blue-700 p-3 text-white">
		<a href="#" class="hover:underline">EXAMPLE PAGE</a>
		<a href="#" class="hover:underline">EXAMPLE PAGE</a>
		<a href="#" class="hover:underline">EXAMPLE PAGE</a>
		<a href="#" class="hover:underline">EXAMPLE PAGE</a>
	</nav>

	<section class="relative bg-gray-300 px-4 py-20 text-center text-white">
		<button class="absolute top-1/2 left-0 -translate-y-1/2 transform px-2 text-3xl text-black"
			>&lt;</button
		>
		<div class="mx-auto max-w-3xl">
			<h2 class="mb-4 text-2xl font-light md:text-3xl">
				Images of the admins choosing and maybe updates and news
			</h2>
		</div>
		<button class="absolute top-1/2 right-0 -translate-y-1/2 transform px-2 text-3xl text-black"
			>&gt;</button
		>
	</section>

	<section class="bg-gray-200 px-4 py-2 text-center text-sm text-gray-700">
		<p>
			Description of the image and this would show up if you clicked on the image or your mouse
			hovers over it
		</p>
	</section>

	<section class="flex flex-wrap items-center justify-center gap-6 px-4 py-10">
		<div class="w-36 rounded bg-blue-700 py-4 text-center text-white shadow-md">
			<div class="mx-auto mb-2 h-16 w-16 rounded-full bg-gray-300"></div>
			<p>Staff Name</p>
		</div>
		<div class="w-36 rounded bg-blue-700 py-4 text-center text-white shadow-md">
			<div class="mx-auto mb-2 h-16 w-16 rounded-full bg-gray-300"></div>
			<p>Staff Name</p>
		</div>
		<div class="w-36 rounded bg-blue-700 py-4 text-center text-white shadow-md">
			<div class="mx-auto mb-2 h-16 w-16 rounded-full bg-gray-300"></div>
			<p>Staff Name</p>
		</div>
		<div class="w-36 rounded bg-blue-700 py-4 text-center text-white shadow-md">
			<div class="mx-auto mb-2 h-16 w-16 rounded-full bg-gray-300"></div>
			<p>Staff Name</p>
		</div>
	</section>

	<div class="fixed right-0 bottom-0 m-4 rounded bg-gray-200 px-4 py-2 text-black shadow-lg">
		Chat
	</div>
	<a href="/auth/logout" class="btn btn-danger p-2 py-0">Logout</a>
</main>
