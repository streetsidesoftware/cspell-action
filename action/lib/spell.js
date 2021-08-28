"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lint = void 0;
const cspellApp = __importStar(require("cspell"));
const cspell_1 = require("cspell");
function nullEmitter(_msg) {
    /* Do Nothings */
}
/**
 *
 * @param files files or glob patterns to check
 * @param root the root directory to scan
 * @param logger logger functions.
 */
async function lint(files, lintOptions, logger) {
    const issues = [];
    const issueCounts = new Map();
    function issue(issue) {
        const uri = issue.uri;
        uri && issueCounts.set(uri, (issueCounts.get(uri) || 0) + 1);
        issues.push(issue);
    }
    function info(message, _msgType) {
        debug(message);
    }
    function debug(message) {
        nullEmitter(message);
        // logger.debug(message);
    }
    function progress(progress) {
        if (!(0, cspell_1.isProgressFileComplete)(progress)) {
            return;
        }
        const issueCount = issueCounts.get(progress.filename) || 0;
        const { fileNum, fileCount, filename, elapsedTimeMs } = progress;
        const issues = issueCount ? ` issues: ${issueCount}` : '';
        const timeMsg = elapsedTimeMs ? `(${elapsedTimeMs.toFixed(2)}ms)` : '-';
        logger.info(`${fileNum}/${fileCount} ${filename}${issues} ${timeMsg}`);
    }
    function error(message, error) {
        logger.error(`${message}
        name: ${error.name}
        msg: ${error.message}
        stack:
${error.stack}
        `);
        return;
    }
    const emitters = {
        issue,
        info,
        debug,
        error,
        progress,
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