"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAppError = exports.isError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.AppError = AppError;
function isError(e) {
    if (!e)
        return false;
    if (typeof e !== 'object')
        return false;
    const err = e;
    return (err.message !== undefined &&
        err.name !== undefined &&
        (err.stack === undefined || typeof err.stack === 'string'));
}
exports.isError = isError;
function isAppError(e) {
    return e instanceof AppError;
}
exports.isAppError = isAppError;
//# sourceMappingURL=error.js.map