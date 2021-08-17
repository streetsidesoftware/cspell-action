"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.setLogger = exports.log = exports.logWarning = exports.logError = void 0;
let _logger = console;
/**
 * See `Console.error`
 */
function logError(...args) {
    _logger.error(...args);
}
exports.logError = logError;
/**
 * See `Console.warn`
 */
function logWarning(...args) {
    _logger.warn(...args);
}
exports.logWarning = logWarning;
/**
 * See `Console.log`
 */
function log(...args) {
    _logger.log(...args);
}
exports.log = log;
/**
 * Set the global cspell-lib logger
 * @param logger - a logger like `console`
 * @returns the old logger.
 */
function setLogger(logger) {
    const oldLogger = _logger;
    _logger = logger;
    return oldLogger;
}
exports.setLogger = setLogger;
/**
 * Get the current cspell-lib logger.
 * @returns the current logger.
 */
function getLogger() {
    return _logger;
}
exports.getLogger = getLogger;
//# sourceMappingURL=logger.js.map