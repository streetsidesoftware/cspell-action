import type { RunResult } from 'cspell';
import { ActionParams } from './ActionParams.js';
import { checkSpelling } from './checkSpelling.js';
import { Context, gatherGitCommitFilesFromContext, gatherFileGlobsFromContext } from './action.js';

export async function checkSpellingForContext(params: ActionParams, context: Context): Promise<true | RunResult> {
    const fileList = await gatherGitCommitFilesFromContext(context);
    const files = await gatherFileGlobsFromContext(context);
    const result = await checkSpelling(params, fileList ? [] : [...files], fileList);
    return result;
}
