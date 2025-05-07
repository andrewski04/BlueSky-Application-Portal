/**
 * Standard error message to be used throughout the app
 */
export class AppError extends Error {
	readonly code: string;

	constructor(
		readonly message: string,
		code: string = 'ERR_UNKNOWN',
		readonly statusCode: number = 500
	) {
		super(message);
		this.code = code.toUpperCase().trim();
	}

	toString(): string {
		return `${this.code} (${this.statusCode}): ${this.message}`;
	}
}

/**
 * Represents either success (Ok) or failure (Err)
 *
 *
 * @example
 * const result: Result<string> = ok('success');
 * if (result.isOk()) {
 *   console.log(result.unwrap()); // 'success' - result.value contains the same value
 * } else {
 *   console.error(result.unwrap()); // error typically shouldn't be unwrapped, handle it instead
 * }
 */
export type Result<T> = Ok<T> | Err<AppError>;

/**
 * Represents a successful operation with a value
 */
export class Ok<T> {
	constructor(readonly value: T) {}

	/**
	 * @returns true if the result is Ok, false otherwise
	 */
	isOk(): this is Ok<T> {
		return true;
	}

	/**
	 * @returns true if the result is Err, false otherwise
	 */
	isErr(): false {
		return false;
	}

	/**
	 * @returns the value of the Ok result
	 * @throws Error if the result is Err
	 */
	unwrap(): T {
		return this.value;
	}
}

/**
 * Represents a failed operation with an error
 */
export class Err<E> {
	constructor(readonly error: E) {}

	/**
	 * @returns true if the result is Ok, false otherwise
	 */
	isOk(): false {
		return false;
	}

	/**
	 * @returns true if the result is Err, false otherwise
	 */
	isErr(): this is Err<E> {
		return true;
	}

	/**
	 * @returns the error of the Err result
	 * @throws Error if the result is Ok
	 *
	 * Err typically shouldn't be unwrapped, unless the error is fatal
	 */
	unwrapErr(): never {
		throw new Error(`Tried to unwrap an Err value: ${this.error}`);
	}
}

/**
 * Used in functions returning Result<T> to return Ok with value
 *
 * @param value - The value to be wrapped in the Ok result
 * @returns An Ok result with the given value
 *
 * @example
 * const function(): Result<> {
 *   return ok('success'); // ok.value == "success"
 * }
 */
export function ok<T>(value: T): Ok<T> {
	return new Ok(value);
}

/**
 * Used in functions returning Result<T> to return Err with error
 *
 * @param error - The error to be wrapped in the Err result
 * @returns An Err result with the given error
 *
 * @example
 * const function(): Result<string> {
 *   return err(new AppError('error', 'ERR_CODE'));
 * }
 */
export function err<E>(error: E): Err<E> {
	return new Err(error);
}
