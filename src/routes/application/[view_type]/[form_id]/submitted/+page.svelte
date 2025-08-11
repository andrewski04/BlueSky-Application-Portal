<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';

	let { data }: PageProps = $props();
	const { applicationResponse } = data;

	onMount(() => {
		// Create a spectacular confetti celebration!
		celebrateWithConfetti();
	});

	function celebrateWithConfetti() {
		// Main burst from center
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		});

		// Multiple bursts from different directions
		setTimeout(() => {
			// Left side burst
			confetti({
				particleCount: 50,
				angle: 60,
				spread: 55,
				origin: { x: 0 }
			});
		}, 200);

		setTimeout(() => {
			// Right side burst
			confetti({
				particleCount: 50,
				angle: 120,
				spread: 55,
				origin: { x: 1 }
			});
		}, 400);

		setTimeout(() => {
			// Top center burst
			confetti({
				particleCount: 80,
				spread: 90,
				origin: { y: 0.1 }
			});
		}, 600);

		// Continuous confetti for 5 seconds
		const duration = 5 * 1000;
		const end = Date.now() + duration;

		(function frame() {
			// Random confetti from various positions
			confetti({
				particleCount: 3,
				angle: Math.random() * 360,
				spread: 30,
				origin: {
					x: Math.random(),
					y: Math.random() * 0.5
				},
				colors: ['#3b82f6', '#1d4ed8', '#60a5fa', '#38bdf8', '#f59e0b', '#10b981']
			});

			// Keep going until we are out of time
			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		})();

		// Final grand finale
		setTimeout(() => {
			confetti({
				particleCount: 200,
				spread: 360,
				origin: { y: 0.5 },
				colors: [
					'#3b82f6',
					'#1d4ed8',
					'#60a5fa',
					'#38bdf8',
					'#f59e0b',
					'#10b981',
					'#ef4444',
					'#8b5cf6'
				]
			});
		}, 5000);
	}
</script>

<svelte:head>
	<title>Application Submitted - BlueSky Institute</title>
	<style>
		.celebration-container {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: calc(100vh - 120px);
			position: relative;
		}

		.message-card {
			background: linear-gradient(200deg);
			border-radius: 20px;
			padding: 60px 40px;
			text-align: center;
			box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
			border: 1px solid rgba(59, 130, 246, 0.1);
			max-width: 600px;
			margin: 20px;
			position: relative;
			z-index: 10;
		}

		.bluesky-logo {
			width: 100px;
			height: 100px;
			background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
			border-radius: 50%;
			margin: 0 auto 30px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
			border: 4px solid white;
			position: relative;
			overflow: hidden;
		}

		.bluesky-logo::before {
			content: '';
			position: absolute;
			top: -50%;
			left: -50%;
			width: 200%;
			height: 200%;
			background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			animation: logoShine 2s infinite;
		}

		.bluesky-logo-text {
			color: white;
			font-weight: bold;
			font-size: 14px;
			z-index: 2;
			position: relative;
		}

		.congratulations-text {
			font-size: 42px;
			color: white;
			font-weight: bold;
		}

		.home-button {
			background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #38bdf8 100%);
			color: white;
			padding: 15px 30px;
			border-radius: 25px;
			font-size: 16px;
			font-weight: 600;
			display: inline-block;
			margin-top: 20px;
			box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
			text-decoration: none;
			transition:
				transform 0.2s ease,
				box-shadow 0.2s ease;
		}

		.home-button:hover {
			transform: translateY(-2px);
			box-shadow: 0 12px 24px rgba(16, 185, 129, 0.4);
		}

		@keyframes logoShine {
			0% {
				transform: translateX(-100%) translateY(-100%) rotate(45deg);
			}
			100% {
				transform: translateX(100%) translateY(100%) rotate(45deg);
			}
		}
	</style>
</svelte:head>

<div class="celebration-container body-container">
	<div class="message-card bg-blue-600">
		<div class="bluesky-logo">
			<img src="/pictures/BlueSky_logo_wh.png" alt="BlueSky Institute Logo" />
		</div>

		<div class="congratulations-text mb-4">Congratulations,</div>
		<div class="text-2xl text-white">your application</div>
		<div class="mt-6 text-2xl font-bold text-white">has been submitted!</div>

		<a class="home-button" href="/">🎉 Back To Home Page 🎉</a>
	</div>
</div>
