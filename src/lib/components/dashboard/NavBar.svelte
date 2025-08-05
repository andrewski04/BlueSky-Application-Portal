<script lang="ts">
	import { page } from '$app/state';

	let { message, buttons } = $props();

	function isActive(path: string): boolean {
		return page.url.pathname.startsWith(path);
	}
</script>

<div class="fixed-header">
	<header class="header-section flex items-center px-3 py-1 text-white">
		<div
			class="logo-container mr-3 flex h-6 w-6 items-center justify-center rounded text-xs font-bold md:h-8 md:w-8"
		>
			<img src="/pictures/BlueSky_logo_wh.png" alt="BlueSky Logo" />
		</div>
		<div class="flex-grow text-center">
			<h1 class="main-title text-sm font-bold md:text-base">BlueSky Institute</h1>
			<p class="text-[10px] text-blue-100 opacity-90 md:text-xs">{message}</p>
		</div>
		<button
			class="inbox-button cursor-pointer rounded px-2 py-1 text-xs font-semibold text-white transition-all duration-300 md:px-3"
		>
			<svg
				class="mr-1 inline h-3 w-3 md:h-4 md:w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
				></path>
			</svg>
			Inbox
		</button>
	</header>
	<nav class="nav-section flex justify-center space-x-1 px-1 py-1 text-white md:space-x-2 md:px-3">
		{#each buttons as button}
			<a
				href={button.href}
				class="nav-link rounded px-1 py-1 text-xs font-medium md:px-3 md:text-sm {isActive(
					button.href
				)
					? 'active'
					: ''}"
			>
				{#if button.icon}
					<button.icon class="mr-1 inline h-3 w-3 stroke-white md:h-4 md:w-4" />
				{/if}
				{button.label}
			</a>
		{/each}
	</nav>
</div>

<style>
	.fixed-header {
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		background: linear-gradient(
			135deg,
			#1e40af 0%,
			#1d4ed8 25%,
			#2563eb 50%,
			#3b82f6 75%,
			#60a5fa 100%
		);
		box-shadow:
			0 8px 32px rgba(59, 130, 246, 0.3),
			0 4px 16px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Enhanced logo with blue glow effect - smaller size */
	.logo-container {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
		box-shadow:
			0 0 15px rgba(59, 130, 246, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
	}

	.logo-container::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transform: rotate(45deg);
		animation: logoShine 3s infinite;
	}

	@keyframes logoShine {
		0% {
			transform: translateX(-100%) translateY(-100%) rotate(45deg);
		}
		50% {
			transform: translateX(100%) translateY(100%) rotate(45deg);
		}
		100% {
			transform: translateX(-100%) translateY(-100%) rotate(45deg);
		}
	}

	/* Enhanced navigation tabs */
	.nav-section {
		background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-link {
		position: relative;
		overflow: hidden;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-link.active {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #38bdf8 100%);
		box-shadow:
			0 4px 16px rgba(96, 165, 250, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.nav-link::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.nav-link:hover {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
		box-shadow:
			0 4px 16px rgba(59, 130, 246, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.nav-link:hover::before {
		left: 100%;
	}

	.inbox-button {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #38bdf8 100%);
		box-shadow:
			0 4px 16px rgba(96, 165, 250, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.3);
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.inbox-button::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
		transform: scale(0);
		transition: transform 0.3s ease;
	}

	.inbox-button:hover {
		background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #38bdf8 100%);
		box-shadow:
			0 6px 20px rgba(96, 165, 250, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
	}

	.inbox-button:hover::before {
		transform: scale(1);
	}

	.main-title {
		background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
		position: relative;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
