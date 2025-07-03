export class AppError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export function isError(e: unknown): e is Error {
    if (!e) return false;
    if (typeof e !== 'object') return false;
    return e instanceof Error;
}

export function isAppError(e: unknown): e is AppError {
    return e instanceof AppError;
}

/**
 * Convert an unknown value to an error
 * @param e - the unknown error
 * @returns Error
 */
export function toError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (typeof e === 'string') return new Error(e);
    const err = new Error('Unknown error x');
    err.cause = e;
    return err;
}
