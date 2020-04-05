"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cspellApp = require("cspell");
/**
 *
 * @param files files or glob patterns to check
 * @param root the root directory to scan
 * @param logger logger functions.
 */
async function lint(files, lintOptions, logger) {
    const issues = [];
    function issue(issue) { issues.push(issue); }
    function info(message, msgType) {
        switch (msgType) {
            case 'Debug':
                logger.debug(message);
                break;
            case 'Info':
            case 'Progress':
            default:
                logger.info(message);
                break;
        }
    }
    function debug(message) { logger.debug(message); }
    function error(message, error) {
        logger.error(`${message}
        name: ${error.name}
        msg: ${error.message}
        stack:
${error.stack}
        `);
        return Promise.resolve();
    }
    const emitters = {
        issue,
        info,
        debug,
        error,
    };
    const options = { ...lintOptions };
    const result = await cspellApp.lint(files, options, emitters);
    return {
        issues,
        result,
    };
}
exports.lint = lint;
//# sourceMappingURL=spell.js.map