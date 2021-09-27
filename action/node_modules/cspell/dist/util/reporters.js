"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadReporters = exports.mergeReporters = void 0;
const errors_1 = require("./errors");
function callAll(methods) {
    return (...p) => {
        for (const method of methods) {
            method(...p);
        }
        return;
    };
}
function extractEmitter(reporters, emitterName) {
    // The `bind` is used in case the reporter is a class.
    return reporters.map((r) => r[emitterName].bind(r));
}
function mergeResultEmitters(reporters) {
    return async (result) => {
        await Promise.all(reporters.map((reporter) => reporter.result(result)));
    };
}
/**
 * Mergers several cspell reporters into a single one
 */
function mergeReporters(...reporters) {
    return {
        issue: callAll(extractEmitter(reporters, 'issue')),
        info: callAll(extractEmitter(reporters, 'info')),
        debug: callAll(extractEmitter(reporters, 'debug')),
        progress: callAll(extractEmitter(reporters, 'progress')),
        error: callAll(extractEmitter(reporters, 'error')),
        result: mergeResultEmitters(reporters),
    };
}
exports.mergeReporters = mergeReporters;
function loadReporter(reporterSettings) {
    if (!Array.isArray(reporterSettings)) {
        reporterSettings = [reporterSettings];
    }
    const [moduleName, settings] = reporterSettings;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getReporter } = require(moduleName);
        return getReporter(settings);
    }
    catch (e) {
        throw new errors_1.ApplicationError(`Failed to load reporter ${moduleName}: ${(0, errors_1.toError)(e).message}`);
    }
}
/**
 * Loads reporter modules configured in cspell config file
 */
function loadReporters({ reporters = [] }) {
    return reporters.map(loadReporter).filter((v) => v !== undefined);
}
exports.loadReporters = loadReporters;
//# sourceMappingURL=reporters.js.map