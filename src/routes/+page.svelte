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
				rgba(29, 78, 216, 0.8) 0%,
				rgba(37, 99, 235, 0.8) 50%,
				rgba(59, 130, 246, 0.8) 100%
			);
			box-shadow:
				0 8px 32px rgba(59, 130, 246, 0.1),
				0 4px 16px rgba(0, 0, 0, 0.05);
			border: 1px solid rgba(59, 130, 246, 0.1);
			backdrop-filter: blur(10px);
			border-radius: 16px;
			transition: all 0.3s ease;
		}

		.apply-prompt:hover {
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.15),
				0 6px 20px rgba(0, 0, 0, 0.08);
			transform: translateY(-2px);
		}

		/* Enhanced staff cards with glassmorphism */
		.staff-card {
			background: linear-gradient(
				135deg,
				rgba(59, 130, 246, 0.9) 0%,
				rgba(37, 99, 235, 0.95) 50%,
				rgba(29, 78, 216, 1) 100%
			);
			box-shadow:
				0 8px 32px rgba(59, 130, 246, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.2);
			backdrop-filter: blur(10px);
			position: relative;
			overflow: hidden;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.staff-card::before {
			content: '';
			position: absolute;
			top: -50%;
			left: -50%;
			width: 200%;
			height: 200%;
			background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
			transform: rotate(45deg);
			transition: all 0.5s ease;
			opacity: 0;
		}

		.staff-card:hover {
			background: linear-gradient(
				135deg,
				rgba(96, 165, 250, 0.95) 0%,
				rgba(59, 130, 246, 1) 50%,
				rgba(37, 99, 235, 1) 100%
			);
			box-shadow:
				0 12px 40px rgba(59, 130, 246, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: translateY(-4px) scale(1.02);
			border-color: rgba(255, 255, 255, 0.4);
		}

		.staff-card:hover::before {
			opacity: 1;
			transform: translateX(100%) translateY(100%) rotate(45deg);
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
		<div class="apply-prompt w-full max-w-xl rounded-lg shadow-lg">
			<div
				class="flex w-full flex-col items-center rounded-t-xl border-b-1 border-gray-500/20 bg-blue-900/30"
			>
				<img
					src="/pictures/BlueSky_ETSU_Horizontal_White.svg"
					alt="BlueSky Institute"
					class=" h-40"
				/>
			</div>
			<div class="flex flex-col items-center gap-6 p-6 text-center">
				<h1 class=" text-4xl font-bold whitespace-nowrap text-white">Apply Now!</h1>
				<p class=" text-lg text-white">
					Create a new account to get started, or login to your existing account to resume your
					application.
				</p>
				<div class="flex flex-row items-center gap-6">
					<a href="/auth/register" class="btn-green mx-auto block w-24 px-0 py-2">Register</a>
					<a href="/auth/login" class="btn-blue mx-auto block w-24 px-0 py-2">Login</a>
				</div>

				<div class="rounded-lg bg-white/90 p-2">
					<p class="text-md text-black">
						<img src="/icons/info.svg" alt="Info" class="inline-block h-4 w-4" />
						Before you apply, ensure that you have already completed the ETSU application. To learn more,
						see the
						<a class="text-blue-500 underline" href="https://www.etsu.edu/admissions/bluesky.php"
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

	<section class="pt-8 pb-16">
		<div class="container mx-auto">
			<h3 class="mb-12 text-center text-3xl font-bold text-gray-800">Meet Our Team</h3>
			<div class="flex flex-wrap items-stretch justify-center gap-8">
				<div class="staff-card w-56 rounded-2xl p-6 text-center text-white shadow-lg">
					<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
						<img
							src="/pictures/staff/leonbradley.jpg"
							alt="Bradley Leon"
							class="h-full w-full object-cover"
						/>
					</div>
					<h4 class="mb-1 text-lg font-semibold">Bradley Leon</h4>
					<p class="text-sm text-blue-100">BlueCross Site Director</p>
				</div>
				<div class="staff-card w-56 rounded-2xl p-6 text-center text-white shadow-lg">
					<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
						<img
							src="/pictures/staff/youngchristel.jpg"
							alt="Christel Young"
							class="h-full w-full object-cover"
						/>
					</div>
					<h4 class="mb-1 text-lg font-semibold">Christel Young</h4>
					<p class="text-sm text-blue-100">ETSU Site Director</p>
				</div>
				<div class="staff-card w-56 rounded-2xl p-6 text-center text-white shadow-lg">
					<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
						<img
							src="/pictures/staff/grahammelissa.jpg"
							alt="Melissa Graham"
							class="h-full w-full object-cover"
						/>
					</div>
					<h4 class="mb-1 text-lg font-semibold">Melissa Graham</h4>
					<p class="text-sm text-blue-100">Student Success Manager</p>
				</div>
				<div class="staff-card w-56 rounded-2xl p-6 text-center text-white shadow-lg">
					<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
						<img
							src="/pictures/staff/wilsonhaley.jpg"
							alt="Haley Wilson"
							class="h-full w-full object-cover"
						/>
					</div>
					<h4 class="mb-1 text-lg font-semibold">Haley Wilson</h4>
					<p class="text-sm text-blue-100">Student Recruiter</p>
				</div>

				<div class="staff-card w-56 rounded-2xl p-6 text-center text-white shadow-lg">
					<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
						<img
							src="/pictures/staff/rochellewilliam.jpg"
							alt="William Rochelle"
							class="h-full w-full object-cover"
						/>
					</div>
					<h4 class="mb-1 text-lg font-semibold">William Rochelle</h4>
					<p class="text-sm text-blue-100">Professor</p>
				</div>
				<div class="staff-card w-56 rounded-2xl p-6 text-center text-white shadow-lg">
					<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
						<img
							src="/pictures/staff/burtonbenjamin.jpg"
							alt="Benjamin Burton"
							class="h-full w-full object-cover"
						/>
					</div>
					<h4 class="mb-1 text-lg font-semibold">Benjamin Burton</h4>
					<p class="text-sm text-blue-100">Professor</p>
				</div>
			</div>
		</div>
	</section>
</div>
