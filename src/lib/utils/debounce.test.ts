import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should debounce function calls with default delay', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn);

		// Call multiple times rapidly
		debouncedFn();
		debouncedFn();
		debouncedFn();

		// Function should not be called yet
		expect(mockFn).not.toHaveBeenCalled();

		// Advance time by default delay (1000ms)
		vi.advanceTimersByTime(1000);

		// Function should be called once
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should debounce function calls with custom delay', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 500);

		// Call multiple times rapidly
		debouncedFn();
		debouncedFn();
		debouncedFn();

		// Function should not be called yet
		expect(mockFn).not.toHaveBeenCalled();

		// Advance time by 400ms (not enough)
		vi.advanceTimersByTime(400);
		expect(mockFn).not.toHaveBeenCalled();

		// Advance time by 100ms more (total 500ms)
		vi.advanceTimersByTime(100);

		// Function should be called once
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should pass arguments to the debounced function', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn('arg1', 'arg2');
		vi.advanceTimersByTime(100);

		expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
	});

	it('should reset timer on each call', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 1000);

		// First call
		debouncedFn();

		// Wait 500ms
		vi.advanceTimersByTime(500);
		expect(mockFn).not.toHaveBeenCalled();

		// Second call (resets timer)
		debouncedFn();

		// Wait 500ms (should not trigger yet)
		vi.advanceTimersByTime(500);
		expect(mockFn).not.toHaveBeenCalled();

		// Wait 500ms more (total 1000ms from second call)
		vi.advanceTimersByTime(500);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should handle multiple rapid calls correctly', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		// Call 10 times rapidly
		for (let i = 0; i < 10; i++) {
			debouncedFn(i);
		}

		expect(mockFn).not.toHaveBeenCalled();

		// Wait for delay
		vi.advanceTimersByTime(100);

		// Should be called once with last argument
		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith(9);
	});

	it('should work with different types of functions', () => {
		// Test with function that returns a value
		const mockFn1 = vi.fn().mockReturnValue('result');
		const debouncedFn1 = debounce(mockFn1, 100);

		debouncedFn1();
		vi.advanceTimersByTime(100);
		expect(mockFn1).toHaveBeenCalledTimes(1);

		// Test with function that takes no arguments
		const mockFn2 = vi.fn();
		const debouncedFn2 = debounce(mockFn2, 100);

		debouncedFn2();
		vi.advanceTimersByTime(100);
		expect(mockFn2).toHaveBeenCalledTimes(1);
	});

	it('should handle edge cases', () => {
		const mockFn = vi.fn();

		// Test with 0ms delay - should execute immediately
		const debouncedFnZero = debounce(mockFn, 0);
		debouncedFnZero();
		// For 0ms delay, the function should execute immediately
		expect(mockFn).toHaveBeenCalledTimes(1);

		// Reset mock for next test
		vi.clearAllMocks();

		// Test with negative delay - should default to 1000ms
		const debouncedFnNegative = debounce(mockFn, -100);
		debouncedFnNegative();
		vi.advanceTimersByTime(100);
		expect(mockFn).not.toHaveBeenCalled(); // Should not be called yet

		vi.advanceTimersByTime(900); // Total 1000ms
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should work with async functions', async () => {
		const mockAsyncFn = vi.fn().mockResolvedValue('async result');
		const debouncedAsyncFn = debounce(mockAsyncFn, 100);

		debouncedAsyncFn();
		vi.advanceTimersByTime(100);

		// Wait for async function to complete
		await vi.runAllTimersAsync();

		expect(mockAsyncFn).toHaveBeenCalledTimes(1);
	});

	it('should handle function context correctly', () => {
		const context = { value: 42 };
		const mockFn = vi.fn(function (this: typeof context) {
			expect(this.value).toBe(42);
		});

		const debouncedFn = debounce(mockFn, 100);
		// Use call to set the context
		debouncedFn.call(context);
		vi.advanceTimersByTime(100);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should work with arrow functions', () => {
		const mockArrowFn = vi.fn(() => 'arrow result');
		const debouncedArrowFn = debounce(mockArrowFn, 100);

		debouncedArrowFn();
		vi.advanceTimersByTime(100);

		expect(mockArrowFn).toHaveBeenCalledTimes(1);
		expect(mockArrowFn).toHaveBeenCalledWith();
	});

	it('should handle multiple debounced functions independently', () => {
		const mockFn1 = vi.fn();
		const mockFn2 = vi.fn();

		const debouncedFn1 = debounce(mockFn1, 100);
		const debouncedFn2 = debounce(mockFn2, 200);

		// Call both functions
		debouncedFn1();
		debouncedFn2();

		// Wait 100ms - first function should be called
		vi.advanceTimersByTime(100);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).not.toHaveBeenCalled();

		// Wait 100ms more - second function should be called
		vi.advanceTimersByTime(100);
		expect(mockFn2).toHaveBeenCalledTimes(1);
	});
});
