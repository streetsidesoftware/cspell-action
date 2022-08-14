"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.CSpellReporterForGithubAction = void 0;
const core = __importStar(require("@actions/core"));
const command_1 = require("@actions/core/lib/command");
const vscode_uri_1 = require("vscode-uri");
const path = __importStar(require("path"));
function nullEmitter(_msg) {
    /* Do Nothings */
}
class CSpellReporterForGithubAction {
    constructor(reportIssueCommand, options, logger = core) {
        this.reportIssueCommand = reportIssueCommand;
        this.options = options;
        this.logger = logger;
        this.issues = [];
        this.issueCounts = new Map();
        this.result = {
            files: -1,
            filesWithIssues: new Set(),
            issues: -1,
            errors: -1,
            cachedFiles: 0,
        };
        this.finished = false;
        this.reporter = {
            debug: (...args) => this._debug(...args),
            error: (...args) => this._error(...args),
            info: (...args) => this._info(...args),
            issue: (...args) => this._issue(...args),
            progress: (...args) => this._progress(...args),
            result: (...args) => this._result(...args),
        };
        this.verbose = options.verbose;
    }
    _issue(issue) {
        const { issues, issueCounts } = this;
        const uri = issue.uri;
        uri && issueCounts.set(uri, (issueCounts.get(uri) || 0) + 1);
        issues.push(issue);
    }
    _info(message, _msgType) {
        this._debug(message);
    }
    _debug(message) {
        nullEmitter(message);
        // logger.debug(message);
    }
    _progress(progress) {
        if (!this.verbose || !isProgressFileComplete(progress)) {
            return;
        }
        const { issueCounts, logger } = this;
        const issueCount = issueCounts.get(progress.filename) || 0;
        const { fileNum, fileCount, filename, elapsedTimeMs } = progress;
        const issues = issueCount ? ` issues: ${issueCount}` : '';
        const timeMsg = elapsedTimeMs ? `(${elapsedTimeMs.toFixed(2)}ms)` : '-';
        logger.info(`${fileNum}/${fileCount} ${filename}${issues} ${timeMsg}`);
    }
    _error(message, error) {
        const { logger } = this;
        logger.error(`${message}
        name: ${error.name}
        msg: ${error.message}
        stack:
${error.stack}
        `);
        return;
    }
    _result(result) {
        Object.assign(this.result, result);
        this.finished = true;
        const command = this.reportIssueCommand;
        if (!['error', 'warning'].includes(command)) {
            return;
        }
        const cwd = process.cwd();
        this.issues.forEach((item) => {
            // format: ::warning file={name},line={line},col={col}::{message}
            (0, command_1.issueCommand)(command, {
                file: relative(cwd, item.uri || ''),
                line: item.row,
                col: item.col,
            }, `Unknown word (${item.text})`);
            console.warn(`${relative(cwd, item.uri || '')}:${item.row}:${item.col} Unknown word (${item.text})`);
        });
    }
}
exports.CSpellReporterForGithubAction = CSpellReporterForGithubAction;
function isProgressFileComplete(p) {
    return p.type === 'ProgressFileComplete';
}
function relative(cwd, fileUri) {
    const fsPath = vscode_uri_1.URI.parse(fileUri).fsPath;
    return path.relative(cwd, fsPath);
}
