import { actionFromCli } from './action.js';
import { info, setFailed } from './actions/core/index.js';
import { toError } from './error.js';

export async function run(): Promise<undefined | Error> {
    try {
        info('cspell-action-cli');
        await actionFromCli({
            files: '**',
            verbose: 'true',
        });
        info('Done.');
        return undefined;
    } catch (error) {
        console.error(error);
        const err = toError(error);
        setFailed(err.message);
        return err;
    }
}
