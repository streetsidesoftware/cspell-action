export class AppError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export function isError(e: unknown): e is Error {
    if (!e) return false;
    if (typeof e !== 'object') return false;
    const err = <Error>e;
    return (
        err.message !== undefined &&
        err.name !== undefined &&
        (err.stack === undefined || typeof err.stack === 'string')
    );
}

export function isAppError(e: unknown): e is AppError {
    return e instanceof AppError;
}
