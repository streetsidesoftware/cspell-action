"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfFn = void 0;
const timer_1 = require("./timer");
/**
 * Measure and log result.
 * @param fn - function to measure.
 * @param message - message to log
 * @param callback - called when the function has finished.
 * @returns a function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function perfFn(fn, message, callback = (message, time) => console.error(`${message}: ${time.toFixed(2)}ms`)) {
    return (...args) => {
        const timer = (0, timer_1.createTimer)();
        const r = fn(...args);
        callback(message, timer.elapsed());
        return r;
    };
}
exports.perfFn = perfFn;
//# sourceMappingURL=debugPerf.js.map