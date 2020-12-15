import * as core from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';
import * as gitHubApi from '@actions/github';
import { getOctokit } from '@actions/github';
import { getPullRequestFiles } from './github';
import { Octokit } from '@octokit/rest';
import { lint } from './spell';
import * as path from 'path';

type GitHub = ReturnType<typeof getOctokit>;

type Context = typeof gitHubApi.context;

export async function pullRequest(context: Context, github: GitHub): Promise<void> {
    core.info(`Pull Request: ${context.eventName}`);
    if (github) {
        core.info('github');
        const pull_number = context.payload.pull_request?.number || 0;
        const files = await getPullRequestFiles(github as Octokit, { ...context.repo, pull_number });
        await checkSpelling(files);
    }
}

export async function push(context: Context, github: GitHub): Promise<void> {
    core.info(`Push: ${context.eventName}`);
    context.sha;
    const result = await github.git.getCommit({ commit_sha: context.sha, ...context.repo });
    core.info(`result: ${JSON.stringify(result, null, 2)}`);
}

async function checkSpelling(files: string[]) {
    const result = await lint(files, { root: process.cwd() }, core);
    result.issues.forEach(item => {
        issueCommand('warning', {
            file: path.relative(process.cwd(), item.uri || ''),
            line: item.row,
            col: item.col
          }, `Unknown word (${item.text})`)
    })
}

function getGithubToken(): string {
    const t0 = core.getInput('github_token', { required: true });
    if (t0[0] !== '$') {
        return t0;
    }
    return process.env[t0.slice(1)] || 'undefined';
}

async function action() {
    const context = gitHubApi.context;

    const github = getOctokit(getGithubToken());
    core.info(`context: ${JSON.stringify(context, null, 2)}`);

    switch (context.eventName) {
        case 'push':
            return push(context, github);
        case 'pull_request':
            return pullRequest(context, github);
        default:
            core.info(`Unknown event: '${context.eventName}'`);
    }
}

async function run(): Promise<void> {
    try {
        core.info('cspell-action');
        await action();
        core.info('Done.');
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
