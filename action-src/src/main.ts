// Must include .pnp before anything else
// require('../.pnp.js').setup();

import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { AppError, isAppError, isError } from './error';
import { action } from './action';
import { format } from 'util';

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
        const githubContext = new Context();
        const githubToken = getGithubToken();
        await action(githubContext, getOctokit(githubToken));
        core.info('Done.');
    } catch (error) {
        console.error(error);
        core.setFailed(isAppError(error) ? error.message : isError(error) ? error : format(error));
    }
}
