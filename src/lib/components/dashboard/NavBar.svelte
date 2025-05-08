<script lang="ts">
	let props = $props();
	let { message } = props;
</script>

<header class="flex items-center justify-between bg-blue-800 p-4 text-white">
	<div class="flex-1"></div>
	<div class="flex items-center">
		<img src="/pictures/BlueSky_logo_wh.png" alt="BlueSky Logo" class="mr-4 h-10 w-10" />
		<h1 class="text-xl font-bold">{message}</h1>
	</div>
	<div class="flex flex-1 justify-end">
		<a href="/auth/logout" class="btn btn-danger px-3 py-1">Logout</a>
	</div>
</header>
<nav class="flex justify-center space-x-6 bg-blue-700 p-3 text-white">
	<slot></slot>
</nav>
