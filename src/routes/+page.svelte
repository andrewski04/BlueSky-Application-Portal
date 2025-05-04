<script lang="ts">
</script>

<svelte:head>
	<title>BlueSky Application</title>
</svelte:head>

<div class="bg-secondary flex min-h-screen items-center justify-center">
	<div class="bg-primary mx-auto my-8 w-full max-w-lg rounded-lg p-12 shadow-lg">
		<div class="text-center text-white">
			<h1 class="mb-4 text-4xl font-bold whitespace-nowrap">Apply for BlueSky Now!</h1>
			<p class="mb-8 text-lg">Ensure that you have already submitted your ETSU application.</p>
			<div class="flex flex-col items-center space-y-6">
				<div>
					<p class="mb-6 text-base">Start a new application now</p>
					<a href="/auth/register" class="btn btn-success mx-auto block w-32">Register</a>
				</div>
				<hr class="w-48 border-gray-300" />
				<div>
					<p class="mb-6 text-base">Or, resume your application or check its status</p>
					<a href="/auth/login" class="btn mx-auto block w-32">Login</a>
				</div>
			</div>
		</div>
	</div>
</div>
