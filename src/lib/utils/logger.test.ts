import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogConfig, LogLevel } from './logger';

describe('Logger', () => {
	let mockConsole: {
		log: ReturnType<typeof vi.fn>;
		info: ReturnType<typeof vi.fn>;
		warn: ReturnType<typeof vi.fn>;
		error: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		// Mock console methods
		mockConsole = {
			log: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		};

		// Replace console methods
		Object.defineProperty(global, 'console', {
			value: mockConsole,
			writable: true
		});

		// Reset global config
		LogConfig.globalMinLevel = LogLevel.DEBUG;
		LogConfig.enabled = true;
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	describe('LogConfig', () => {
		it('should have default values', () => {
			expect(LogConfig.globalMinLevel).toBe(LogLevel.DEBUG);
			expect(LogConfig.enabled).toBe(true);
		});

		it('should set global level', () => {
			LogConfig.setGlobalLevel(LogLevel.WARN);
			expect(LogConfig.globalMinLevel).toBe(LogLevel.WARN);
		});

		it('should set global enabled state', () => {
			LogConfig.setGlobalEnabled(false);
			expect(LogConfig.enabled).toBe(false);
		});
	});

	describe('Logger constructor', () => {
		it('should create logger with default values', () => {
			const logger = new Logger('test-module');

			expect(logger).toBeInstanceOf(Logger);
		});

		it('should create logger with custom enabled state', () => {
			const logger = new Logger('test-module', false);

			expect(logger).toBeInstanceOf(Logger);
		});

		it('should create logger with custom min level', () => {
			const logger = new Logger('test-module', true, LogLevel.WARN);

			expect(logger).toBeInstanceOf(Logger);
		});

		it('should create logger with all custom values', () => {
			const logger = new Logger('test-module', false, LogLevel.ERROR);

			expect(logger).toBeInstanceOf(Logger);
		});
	});

	describe('Logger methods', () => {
		let logger: Logger;

		beforeEach(() => {
			logger = new Logger('test-module');
		});

		describe('debug', () => {
			it('should log debug message when level allows', () => {
				logger.debug('Debug message');

				expect(mockConsole.log).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[DEBUG\] \[test-module\]:/),
					'Debug message'
				);
			});

			it('should not log when below global min level', () => {
				LogConfig.setGlobalLevel(LogLevel.INFO);
				logger.debug('Debug message');

				expect(mockConsole.log).not.toHaveBeenCalled();
			});

			it('should not log when below logger min level', () => {
				logger.setMinLevel(LogLevel.INFO);
				logger.debug('Debug message');

				expect(mockConsole.log).not.toHaveBeenCalled();
			});

			it('should not log when globally disabled', () => {
				LogConfig.setGlobalEnabled(false);
				logger.debug('Debug message');

				expect(mockConsole.log).not.toHaveBeenCalled();
			});

			it('should not log when logger disabled', () => {
				logger.setEnabled(false);
				logger.debug('Debug message');

				expect(mockConsole.log).not.toHaveBeenCalled();
			});
		});

		describe('info', () => {
			it('should log info message when level allows', () => {
				logger.info('Info message');

				expect(mockConsole.info).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[INFO\] \[test-module\]:/),
					'Info message'
				);
			});

			it('should not log when below global min level', () => {
				LogConfig.setGlobalLevel(LogLevel.WARN);
				logger.info('Info message');

				expect(mockConsole.info).not.toHaveBeenCalled();
			});
		});

		describe('warn', () => {
			it('should log warning message when level allows', () => {
				logger.warn('Warning message');

				expect(mockConsole.warn).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[WARN\] \[test-module\]:/),
					'Warning message'
				);
			});

			it('should not log when below global min level', () => {
				LogConfig.setGlobalLevel(LogLevel.ERROR);
				logger.warn('Warning message');

				expect(mockConsole.warn).not.toHaveBeenCalled();
			});
		});

		describe('error', () => {
			it('should log error message when level allows', () => {
				logger.error('Error message');

				expect(mockConsole.error).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]:/),
					'Error message'
				);
			});

			it('should log error with Error object', () => {
				const error = new Error('Test error');
				logger.error('Error message', error);

				expect(mockConsole.error).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]:/),
					'Error message'
				);
				expect(mockConsole.error).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]: Error:/),
					'Test error'
				);
				expect(mockConsole.error).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]: Stack:/),
					expect.any(String)
				);
			});

			it('should log error with unknown error object', () => {
				const unknownError = { message: 'Unknown error' };
				logger.error('Error message', unknownError);

				expect(mockConsole.error).toHaveBeenCalledWith(
					expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]: Unknown Error:/),
					unknownError
				);
			});

			it('should not log when below global min level', () => {
				LogConfig.setGlobalLevel(LogLevel.ERROR + 1);
				logger.error('Error message');

				expect(mockConsole.error).not.toHaveBeenCalled();
			});
		});
	});

	describe('Logger configuration', () => {
		let logger: Logger;

		beforeEach(() => {
			logger = new Logger('test-module');
		});

		it('should set enabled state', () => {
			logger.setEnabled(false);
			logger.info('Test message');

			expect(mockConsole.info).not.toHaveBeenCalled();

			logger.setEnabled(true);
			logger.info('Test message');

			expect(mockConsole.info).toHaveBeenCalled();
		});

		it('should set min level', () => {
			logger.setMinLevel(LogLevel.WARN);

			logger.debug('Debug message');
			logger.info('Info message');
			logger.warn('Warning message');
			logger.error('Error message');

			expect(mockConsole.log).not.toHaveBeenCalled();
			expect(mockConsole.info).not.toHaveBeenCalled();
			expect(mockConsole.warn).toHaveBeenCalled();
			expect(mockConsole.error).toHaveBeenCalled();
		});
	});

	describe('Log level hierarchy', () => {
		it('should respect log level hierarchy', () => {
			const logger = new Logger('test-module', true, LogLevel.INFO);

			logger.debug('Debug message');
			logger.info('Info message');
			logger.warn('Warning message');
			logger.error('Error message');

			expect(mockConsole.log).not.toHaveBeenCalled(); // DEBUG
			expect(mockConsole.info).toHaveBeenCalled(); // INFO
			expect(mockConsole.warn).toHaveBeenCalled(); // WARN
			expect(mockConsole.error).toHaveBeenCalled(); // ERROR
		});

		it('should handle all log levels correctly', () => {
			const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];

			levels.forEach((level) => {
				const logger = new Logger('test-module', true, level);

				logger.debug('Debug message');
				logger.info('Info message');
				logger.warn('Warning message');
				logger.error('Error message');

				// Check that only appropriate levels and above are logged
				if (level <= LogLevel.DEBUG) expect(mockConsole.log).toHaveBeenCalled();
				if (level <= LogLevel.INFO) expect(mockConsole.info).toHaveBeenCalled();
				if (level <= LogLevel.WARN) expect(mockConsole.warn).toHaveBeenCalled();
				if (level <= LogLevel.ERROR) expect(mockConsole.error).toHaveBeenCalled();

				vi.clearAllMocks();
			});
		});
	});

	describe('Timestamp and formatting', () => {
		it('should include timestamp in log messages', () => {
			const logger = new Logger('test-module');

			logger.info('Test message');

			const logCall = mockConsole.info.mock.calls[0][0];
			// The format is [timestamp] [LEVEL] [module]:
			const timestampMatch = logCall.match(/^\[(.*?)\]/);
			expect(timestampMatch).toBeTruthy();

			// Verify timestamp format is valid ISO string
			const timestampStr = timestampMatch![1];
			expect(timestampStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

			// Verify timestamp is recent (within last minute)
			const timestamp = new Date(timestampStr);
			const now = new Date();
			const diffMs = now.getTime() - timestamp.getTime();
			expect(diffMs).toBeGreaterThanOrEqual(0);
			expect(diffMs).toBeLessThan(60000); // Within 1 minute
		});

		it('should include module name in log messages', () => {
			const logger = new Logger('custom-module');
			logger.info('Test message');

			const logCall = mockConsole.info.mock.calls[0][0];
			expect(logCall).toContain('[custom-module]');
		});

		it('should format log messages correctly', () => {
			const logger = new Logger('test-module');
			logger.info('Test message');

			const logCall = mockConsole.info.mock.calls[0][0];
			expect(logCall).toMatch(/^\[.*\] \[INFO\] \[test-module\]:$/);
		});
	});

	describe('Error handling', () => {
		it('should handle null error objects', () => {
			const logger = new Logger('test-module');
			logger.error('Error message', null);

			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]:/),
				'Error message'
			);
		});

		it('should handle undefined error objects', () => {
			const logger = new Logger('test-module');
			logger.error('Error message', undefined);

			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringMatching(/\[.*\] \[ERROR\] \[test-module\]:/),
				'Error message'
			);
		});
	});

	describe('Integration scenarios', () => {
		it('should handle multiple loggers independently', () => {
			const logger1 = new Logger('module1', true, LogLevel.INFO);
			const logger2 = new Logger('module2', true, LogLevel.DEBUG);

			logger1.debug('Debug from module1');
			logger2.debug('Debug from module2');

			expect(mockConsole.log).toHaveBeenCalledTimes(1); // Only module2 debug
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('[module2]'),
				'Debug from module2'
			);
		});

		it('should handle rapid logging', () => {
			const logger = new Logger('test-module');

			for (let i = 0; i < 100; i++) {
				logger.info(`Message ${i}`);
			}

			expect(mockConsole.info).toHaveBeenCalledTimes(100);
		});

		it('should handle disabled logging efficiently', () => {
			const logger = new Logger('test-module', false);

			for (let i = 0; i < 1000; i++) {
				logger.info(`Message ${i}`);
			}

			expect(mockConsole.info).not.toHaveBeenCalled();
		});
	});
});
