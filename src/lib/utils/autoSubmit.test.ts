import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { autoSubmit } from './autoSubmit';

describe('autoSubmit', () => {
	let mockForm: HTMLFormElement;
	let mockSendBeacon: ReturnType<typeof vi.fn>;
	let mockAddEventListener: ReturnType<typeof vi.fn>;
	let mockRemoveEventListener: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Mock browser environment using vi.stubGlobal
		vi.stubGlobal('window', {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		});

		vi.stubGlobal('navigator', {
			sendBeacon: vi.fn()
		});

		// Mock FormData
		vi.stubGlobal(
			'FormData',
			vi.fn().mockImplementation(() => ({
				// Mock FormData methods if needed
			}))
		);

		// Get references to mocked functions
		mockSendBeacon = global.navigator.sendBeacon as any;
		mockAddEventListener = global.window.addEventListener as any;
		mockRemoveEventListener = global.window.removeEventListener as any;

		// Create mock form element
		mockForm = {
			action: '/test-action',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		} as unknown as HTMLFormElement;
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('should add beforeunload event listener when called', () => {
		const destroy = autoSubmit(mockForm);

		expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		expect(mockAddEventListener).toHaveBeenCalledTimes(1);
	});

	it('should return destroy function', () => {
		const destroy = autoSubmit(mockForm);

		expect(typeof destroy.destroy).toBe('function');
	});

	it('should remove event listener when destroy is called', () => {
		const destroy = autoSubmit(mockForm);
		destroy.destroy();

		expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
	});

	it('should call sendBeacon with form data on beforeunload', () => {
		const destroy = autoSubmit(mockForm);

		// Get the event handler that was registered
		const eventHandler = mockAddEventListener.mock.calls[0][1];

		// Simulate beforeunload event
		eventHandler();

		expect(mockSendBeacon).toHaveBeenCalledWith('/test-action', expect.any(Object));
		expect(mockSendBeacon).toHaveBeenCalledTimes(1);

		destroy.destroy();
	});

	it('should create FormData from the form element', () => {
		const destroy = autoSubmit(mockForm);

		// Get the event handler that was registered
		const eventHandler = mockAddEventListener.mock.calls[0][1];

		// Simulate beforeunload event
		eventHandler();

		expect(FormData).toHaveBeenCalledWith(mockForm);
		expect(FormData).toHaveBeenCalledTimes(1);

		destroy.destroy();
	});

	it('should handle multiple destroy calls gracefully', () => {
		const destroy = autoSubmit(mockForm);

		// Call destroy multiple times
		destroy.destroy();
		destroy.destroy();

		// Should only remove the event listener once
		expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
	});

	it('should work with different form actions', () => {
		const formWithDifferentAction = {
			...mockForm,
			action: '/different-action'
		} as HTMLFormElement;

		const destroy = autoSubmit(formWithDifferentAction);

		// Get the event handler that was registered
		const eventHandler = mockAddEventListener.mock.calls[0][1];

		// Simulate beforeunload event
		eventHandler();

		expect(mockSendBeacon).toHaveBeenCalledWith('/different-action', expect.any(Object));

		destroy.destroy();
	});
});
