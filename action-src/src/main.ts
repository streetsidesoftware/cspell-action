import { info, setFailed } from '@actions/core';
import { Context } from '@actions/github/lib/context.js';
import { isAppError, isError } from './error.js';
import { action } from './action.js';
import { format } from 'util';

export async function run(): Promise<undefined | Error> {
    try {
        info('cspell-action');
        const githubContext = new Context();

        await action(githubContext);
        info('Done.');
        return undefined;
    } catch (error) {
        console.error(error);
        setFailed(isAppError(error) ? error.message : isError(error) ? error : format(error));
        return isError(error) ? error : Error(format(error));
    }
}
