import * as core from '@actions/core';
import * as gitHubApi from '@actions/github';
import { getOctokit } from '@actions/github';
import { getPullRequestFiles } from './github';
import { Octokit } from '@octokit/rest';
import { wait } from './wait';

type GitHub = ReturnType<typeof getOctokit>;

async function experiment() {
    const ms: string = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds ...`);

    core.debug(new Date().toTimeString());
    await wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());

    core.setOutput('time', new Date().toTimeString());
}

type Context = typeof gitHubApi.context;

export async function pullRequest(context: Context, github: GitHub) {
    core.info(`Pull Request: ${context.eventName}`);
    if (github) {
        core.info('github');
        const pull_number = context.payload.pull_request?.number || 0;
        const files = await getPullRequestFiles(github as Octokit, { ...context.repo, pull_number });
        core.info(files.join('\n'));
    }
}

export async function push(context: Context, github: GitHub) {
    core.info(`Push: ${context.eventName}`);
    context.sha;
    // eslint-disable-next-line @typescript-eslint/camelcase
    const result = await github.git.getCommit({ commit_sha: context.sha, ...context.repo });
    core.info(`result: ${JSON.stringify(result, null, 2)}`);
}

async function action() {
    const context = gitHubApi.context;
    const github = getOctokit(core.getInput('github_token', { required: true }));
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
        await experiment();
        core.info('Done.');
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
