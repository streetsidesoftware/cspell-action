import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const urlTSConfig = new URL('../../tsconfig.json', import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsconfig = JSON.parse(fs.readFileSync(urlTSConfig, 'utf-8'));

export const sourceDir = path.resolve(path.join(__dirname, '..', '..'));
/** Repo Root */
export const root = path.resolve(path.join(sourceDir, '..'));
export const fixturesLocation = path.join(sourceDir, './fixtures');

const outputDir = path.resolve(sourceDir, tsconfig.compilerOptions.outDir);

export const debugDir = outputDir;

export function fetchGithubActionFixture(filename: string): Record<string, string> {
    const absFixtureFile = path.resolve(fixturesLocation, filename);
    const absFixtureDir = path.dirname(absFixtureFile);
    const githubEnv = JSON.parse(fs.readFileSync(absFixtureFile, 'utf-8'));
    if (githubEnv['GITHUB_EVENT_PATH']) {
        githubEnv['GITHUB_EVENT_PATH'] = path
            .resolve(absFixtureDir, githubEnv['GITHUB_EVENT_PATH'])
            .replace(/fixtures[/\\]fixtures/, 'fixtures');
    }
    const env = {
        ...process.env,
        ...githubEnv,
    };

    return env;
}

export function resolveFile(file: string, rootDir = root): string {
    return path.resolve(rootDir, file);
}

export function resolveFiles(files: string[] | undefined, rootDir?: string): string[] | undefined {
    if (!files) return files;
    return files.map((file) => resolveFile(file, rootDir));
}
