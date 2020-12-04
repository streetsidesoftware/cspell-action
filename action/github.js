"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestFiles = void 0;
async function getPullRequestFiles(git, prRef) {
    const { owner, repo, pull_number } = prRef;
    const commits = await git.pulls.listCommits({ owner, repo, pull_number });
    const prFiles = new Set();
    for (const commitRef of commits.data) {
        const ref = commitRef.sha;
        if (!ref)
            continue;
        const commit = await git.repos.getCommit({ owner, repo, ref });
        const files = commit.data.files;
        if (!files)
            continue;
        files.forEach((f) => f.filename && prFiles.add(f.filename));
    }
    return [...prFiles];
}
exports.getPullRequestFiles = getPullRequestFiles;
//# sourceMappingURL=github.js.map