<script lang="ts">
</script>

<svelte:head>
	<title>Apply - BlueSky Tennessee Institute</title>
	<style>
		.purple-bar {
			background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
			position: relative;
			overflow: hidden;
			border-bottom: 6px solid #6366f1;
		}

		.purple-bar::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(
				90deg,
				transparent 0%,
				rgba(255, 255, 255, 0.1) 50%,
				transparent 100%
			);
			animation: shimmer 3s infinite;
		}

		@keyframes shimmer {
			0% {
				transform: translateX(-100%);
			}
			100% {
				transform: translateX(100%);
			}
		}

		.apply-prompt {
			background: linear-gradient(
				135deg,
				rgba(48, 97, 176, 1) 0%,
				rgb(55, 92, 171) 50%,
				rgb(34, 64, 152) 100%
			);
		}

		.apply-prompt:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	</style>
</svelte:head>

<div class="nprogressbar main-container min-h-screen">
	<section class="purple-bar w-full py-4">
		<div class="mx-auto">
			<div class="flex w-full items-center justify-center space-x-8 text-white">
				<div class="text-center">
					<div class="mx-auto max-w-5xl px-4">
						<h2 class="drop-shadow-3xl mb-4 text-3xl font-bold text-white md:text-3xl lg:text-3xl">
							Welcome to BlueSky Tennessee Institute
						</h2>
						<p class="mb-4 text-xl font-semibold text-white drop-shadow-lg md:text-xl">
							Accelerated Bachelor's Degree
						</p>
						<p
							class="mx-auto max-w-3xl text-lg leading-relaxed font-medium text-white drop-shadow-lg md:text-lg lg:text-lg"
						>
							Earn a degree and secure a career at the same time. In just over two years, you can
							earn your Bachelor of Science in Computing from East Tennessee State University — and
							earn a job offer from BlueCross BlueShield of Tennessee.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<div
		class="flex w-full flex-col items-center justify-center gap-8 p-8 lg:flex-row lg:items-stretch"
	>
		<div class="content-card w-full max-w-xl rounded-lg text-black shadow-lg">
			<div class="section-header flex w-full flex-col items-center p-4">
				<img src="/pictures/BlueSky_ETSU_Horizontal.png" alt="BlueSky Institute" class=" h-30" />
				<h1 class="my-4 text-4xl font-bold whitespace-nowrap">Apply Now!</h1>
			</div>
			<div class="flex flex-col items-center p-4 text-center">
				<p class="mb-4 text-lg">
					Create a new account to get started, or login to your existing account to resume your
					application.
				</p>
				<div class="flex flex-row items-center gap-6">
					<a href="/auth/register" class="btn-green mx-auto block w-24 px-0 py-2">Register</a>
					<a href="/auth/login" class="btn-blue mx-auto block w-24 px-0 py-2">Login</a>
				</div>

				<div class=" apply-prompt mt-4 rounded-lg bg-gray-300 p-2">
					<p class="text-md text-white">
						<img src="/icons/info.svg" alt="Info" class="inline-block h-4 w-4" />
						Before you apply, ensure that you have already completed the ETSU application. To learn more,
						see the
						<a class="text-blue-300" href="https://www.etsu.edu/admissions/bluesky.php"
							>ETSU BlueSky page</a
						>.
					</p>
				</div>
			</div>
		</div>
		<div class="content-card w-full max-w-xl rounded-lg text-black shadow-lg">
			<div class="section-header flex w-full flex-col items-center p-4">
				<h1 class="my-4 text-4xl font-bold">Learn More</h1>
			</div>
			<div class="flex flex-col items-center p-4 text-center">
				<p class="mb-4 text-lg">
					<strong>BlueSky Tennessee Institute</strong> is an innovative 27-month accelerated Bachelor's
					program in Computing — a unique partnership between East Tennessee State University and BlueCross
					BlueShield of Tennessee.
				</p>
				<p class="mb-4 text-lg">
					Located at the BCBS campus in Chattanooga, students gain hands-on experience through a
					blend of classroom learning and real-world internships. You'll work alongside professional
					teams, build a strong portfolio, and receive dedicated mentorship to help launch your
					career.
				</p>
				<p class="mb-4 text-lg">Learn more on the BlueSky website or the ETSU BlueSky page.</p>
				<div class="flex flex-row items-center gap-6">
					<a
						href="https://www.blueskytn.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-blue mx-auto block w-40 px-2 py-2">BlueSky Website</a
					>
					<a
						href="https://www.etsu.edu/admissions/bluesky.php"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-yellow mx-auto block w-40 px-2 py-2">ETSU Website</a
					>
				</div>
			</div>
		</div>
	</div>
</div>
