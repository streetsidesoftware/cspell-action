import * as core from '@actions/core';
import * as gitHubApi from '@actions/github';
import { getOctokit } from '@actions/github';
import { Octokit } from '@octokit/rest';
import { AppError } from './error';
import { action } from './action';

function getGithubToken(): string {
    const t0 = core.getInput('github_token', { required: true });
    if (t0[0] !== '$') {
        return t0;
    }
    return process.env[t0.slice(1)] || 'undefined';
}

export async function run(): Promise<void> {
    try {
        core.info('cspell-action');
        const githubContext = gitHubApi.context;
        const githubToken = getGithubToken();
        await action(githubContext, getOctokit(githubToken) as Octokit);
        core.info('Done.');
    } catch (error) {
        console.error(error);
        core.setFailed(error instanceof AppError ? error.message : error);
    }
}
