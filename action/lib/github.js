"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFilesForCommits = exports.getPullRequestFiles = void 0;
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
async function getPullRequestFiles(git, prRef) {
    const { owner, repo, pull_number } = prRef;
    const { rest } = (0, plugin_rest_endpoint_methods_1.restEndpointMethods)(git);
    const commits = await rest.pulls.listCommits({ owner, repo, pull_number });
    return fetchFilesForCommits(git, prRef, commits.data.map((c) => c.sha).filter(isString));
}
exports.getPullRequestFiles = getPullRequestFiles;
function isString(s) {
    return typeof s === 'string';
}
async function fetchFilesForCommits(git, context, commitIds) {
    const files = new Set();
    for await (const file of fetchFilesForCommitsX(git, context, commitIds)) {
        files.add(file);
    }
    return files;
}
exports.fetchFilesForCommits = fetchFilesForCommits;
async function* fetchFilesForCommitsX(git, context, commitIds) {
    const { owner, repo } = context;
    const { rest } = (0, plugin_rest_endpoint_methods_1.restEndpointMethods)(git);
    for (const ref of commitIds) {
        const commit = await rest.repos.getCommit({ owner, repo, ref });
        const files = commit.data.files;
        if (!files)
            continue;
        for (const f of files) {
            if (f.filename) {
                yield f.filename;
            }
        }
    }
}
//# sourceMappingURL=github.js.map