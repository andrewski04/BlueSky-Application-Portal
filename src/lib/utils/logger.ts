export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

export class LogConfig {
	// Default minimum level to log
	static globalMinLevel: LogLevel = LogLevel.DEBUG;

	// Enable/disable all logging
	static enabled: boolean = true;

	static setGlobalLevel(level: LogLevel): void {
		LogConfig.globalMinLevel = level;
	}

	static setGlobalEnabled(enabled: boolean): void {
		LogConfig.enabled = enabled;
	}
}

export class Logger {
	private module: string;
	private enabled: boolean;
	private minLevel: LogLevel;

	/**
	 * Create a new logger instance
	 * @param module The module name that will be displayed in logs
	 * @param enabled Whether this specific logger is enabled
	 * @param minLevel Minimum log level to be logged
	 */
	constructor(
		module: string,
		enabled: boolean = true,
		minLevel: LogLevel = LogConfig.globalMinLevel
	) {
		this.module = module;
		this.enabled = enabled;
		this.minLevel = minLevel;
	}

	/**
	 * Log a message at the specified level
	 * @param message The message to log
	 * @param level The log level
	 * @param error Optional error object to include
	 */
	private log(message: string, level: LogLevel, error?: unknown): void {
		// Skip if logging is disabled globally or for this logger
		if (!LogConfig.enabled || !this.enabled) return;

		// Skip if below minimum log level
		if (level < this.minLevel || level < LogConfig.globalMinLevel) return;

		const timestamp = new Date().toISOString();
		const prefix = `[${timestamp}] [${this.getLevelName(level)}] [${this.module}]:`;

		switch (level) {
			case LogLevel.DEBUG:
				console.log(prefix, message);
				break;
			case LogLevel.INFO:
				console.info(prefix, message);
				break;
			case LogLevel.WARN:
				console.warn(prefix, message);
				break;
			case LogLevel.ERROR:
				console.error(prefix, message);
				if (error) {
					if (error instanceof Error) {
						console.error(`${prefix} Error:`, error.message);
						console.error(`${prefix} Stack:`, error.stack);
					} else {
						console.error(`${prefix} Unknown Error:`, error);
					}
				}
				break;
		}
	}

	/**
	 * Get the string representation of a log level
	 */
	private getLevelName(level: LogLevel): string {
		switch (level) {
			case LogLevel.DEBUG:
				return 'DEBUG';
			case LogLevel.INFO:
				return 'INFO';
			case LogLevel.WARN:
				return 'WARN';
			case LogLevel.ERROR:
				return 'ERROR';
			default:
				return 'UNKNOWN';
		}
	}

	/**
	 * Log a debug message
	 * @param message The message to log
	 * @param error Optional error object
	 */
	debug(message: string, error?: unknown): void {
		this.log(message, LogLevel.DEBUG, error);
	}

	/**
	 * Log an info message
	 * @param message The message to log
	 * @param error Optional error object
	 */
	info(message: string, error?: unknown): void {
		this.log(message, LogLevel.INFO, error);
	}

	/**
	 * Log a warning message
	 * @param message The message to log
	 * @param error Optional error object
	 */
	warn(message: string, error?: unknown): void {
		this.log(message, LogLevel.WARN, error);
	}

	/**
	 * Log an error message
	 * @param message The message to log
	 * @param error Optional error object
	 */
	error(message: string, error?: unknown): void {
		this.log(message, LogLevel.ERROR, error);
	}

	/**
	 * Enable or disable this logger
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Set minimum log level for this logger
	 */
	setMinLevel(level: LogLevel): void {
		this.minLevel = level;
	}
}
