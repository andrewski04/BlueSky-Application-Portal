<script lang="ts">
</script>

<header class="bg-gray-800 p-4">
	<div class="space-x-4">
		<a href="/auth/login" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			>Login</a
		>
		<form action="/auth/logout" method="POST" class="inline">
			<button type="submit" class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
				Logout
			</button>
		</form>
	</div>
</header>
