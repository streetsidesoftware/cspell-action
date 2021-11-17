"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryReporter = void 0;
/**
 * Simple reporter for test purposes
 */
class InMemoryReporter {
    constructor() {
        this.log = [];
        this.errors = [];
        this.issueCount = 0;
        this.errorCount = 0;
        this.debugCount = 0;
        this.infoCount = 0;
        this.progressCount = 0;
        this.issues = [];
        this.issue = (issue) => {
            this.issues.push(issue);
            this.issueCount += 1;
            const { uri, row, col, text } = issue;
            this.log.push(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
        };
        this.error = (message, error) => {
            this.errorCount += 1;
            this.errors.push(error);
            this.log.push(`Error: ${message} ${error.toString()}`);
        };
        this.info = (message) => {
            this.infoCount += 1;
            this.log.push(`Info: ${message}`);
        };
        this.debug = (message) => {
            this.debugCount += 1;
            this.log.push(`Debug: ${message}`);
        };
        this.progress = (p) => {
            this.progressCount += 1;
            this.log.push(`Progress: ${p.type} ${p.fileNum} ${p.fileCount} ${p.filename}`);
        };
        this.result = (r) => {
            this.runResult = r;
        };
        this.dump = () => ({ log: this.log, issues: this.issues, runResult: this.runResult });
    }
}
exports.InMemoryReporter = InMemoryReporter;
//# sourceMappingURL=InMemoryReporter.js.map