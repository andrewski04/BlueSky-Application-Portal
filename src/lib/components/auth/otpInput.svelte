<svelte:options customElement={{ tag: 'otp-input', shadow: 'none' }} />

<script lang="ts">
	let { length = 6, value = '' } = $props();

	// Function to dispatch events to the host
	function dispatch(type: string, detail: string) {
		$host().dispatchEvent(new CustomEvent(type, { detail }));
	}

	// update inputs when value changes in host component
	$effect(() => {
		if (otpInputs.length === Number(length)) {
			if (!value) {
				otpInputs.forEach((input) => {
					input.value = '';
				});
			} else {
				const valueArray = value.split('');
				otpInputs.forEach((input, index) => {
					input.value = valueArray[index] || '';
				});
			}
		}
	});

	// Create an array of the correct length for the inputs
	const inputArray = Array.from({ length: Number(length) });
	let otpInputs: HTMLInputElement[] = $state([]);

	function handleInput(event: Event, index: number) {
		const target = event.target as HTMLInputElement;
		const val = target.value;

		// Handle case where user types in a box that already has a number
		// Only take the last character entered
		if (val.length > 1) {
			target.value = val[val.length - 1];
		}

		// Only allow numeric input
		if (isNaN(Number(target.value))) {
			target.value = '';
			return;
		}

		// Move to next input if value is entered
		if (target.value !== '') {
			const next = otpInputs[index + 1];
			if (next) {
				next.focus();
			}
		}

		// Update the combined OTP value
		updateCombinedOtp();
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		const key = event.key.toLowerCase();
		const target = event.target as HTMLInputElement;

		// Handle backspace/delete when input is empty - move to previous input
		if ((key === 'backspace' || key === 'delete') && target.value === '') {
			const prev = otpInputs[index - 1];
			if (prev) {
				prev.focus();
				// If we're holding backspace, also clear the previous input
				if (event.repeat) {
					prev.value = '';
					updateCombinedOtp();
				}
				// Prevent default to avoid double backspace
				event.preventDefault();
			}
		}
	}

	function handleKeyup(event: KeyboardEvent, index: number) {
		// Update the combined OTP after any key event
		updateCombinedOtp();
	}

	function updateCombinedOtp() {
		value = otpInputs.map((input) => input.value || '').join('');
		dispatch('update', value);
	}

	// Handle paste event for the entire OTP
	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const pasteData = event.clipboardData?.getData('text') || '';
		const digits = pasteData.replace(/\D/g, '').slice(0, Number(length)).split('');

		// Clear existing inputs first
		otpInputs.forEach((input) => (input.value = ''));

		// Fill in the pasted digits
		digits.forEach((digit, i) => {
			if (i < otpInputs.length) {
				otpInputs[i].value = digit;
			}
		});

		// Focus on the next empty input or the last one
		const nextEmptyIndex = digits.length < otpInputs.length ? digits.length : otpInputs.length - 1;
		if (otpInputs[nextEmptyIndex]) {
			otpInputs[nextEmptyIndex].focus();
		}

		updateCombinedOtp();
	}

	// Handle focusing on an input that already has a value
	function handleFocus(event: FocusEvent, index: number) {
		const target = event.target as HTMLInputElement;
		// Select all text in the input when focused
		target.select();
	}
</script>

<div class="flex justify-between gap-2" onpaste={handlePaste}>
	{#each inputArray as _, i}
		<input
			bind:this={otpInputs[i]}
			type="text"
			inputmode="numeric"
			maxlength="1"
			oninput={(e) => handleInput(e, i)}
			onkeydown={(e) => handleKeydown(e, i)}
			onkeyup={(e) => handleKeyup(e, i)}
			onfocus={(e) => handleFocus(e, i)}
			class="aspect-square w-full rounded-md border border-gray-300 px-0 text-center text-xl font-semibold focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
		/>
	{/each}
</div>
