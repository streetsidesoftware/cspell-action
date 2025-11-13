#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const targetPackageDir = '../action';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const srcPackageFile = path.resolve(__dirname, './package.json');
const dstPackageFile = path.resolve(__dirname, targetPackageDir, 'package.json');

async function buildLib() {
    // Note: cjs is the only possible option at this moment.
    await esbuild.build({
        absWorkingDir: __dirname,
        entryPoints: ['src/main_root.ts'],
        bundle: true,
        packages: 'bundle',
        platform: 'node',
        inject: ['src-build/import-meta-url.cjs'],
        define: {
            'import.meta.url': 'import_meta_url',
        },
        outfile: path.join(targetPackageDir, 'lib/main_root.cjs'),
        target: 'node24',
        supported: { 'regexp-unicode-property-escapes': true },
    });
}

async function syncPackage() {
    const pkgSrc = await readPackageJson(srcPackageFile);
    const pkgDst = await readPackageJson(dstPackageFile);

    const deps = pkgSrc['bundledDependencies'].map((dep) => [dep, pkgSrc.dependencies[dep]]);
    pkgDst.dependencies = Object.fromEntries(deps);
    pkgDst.bundledDependencies = pkgSrc.bundledDependencies;

    await writePackageJson(dstPackageFile, pkgDst);
}

async function buildAll() {
    await buildLib();
    await syncPackage();
}

async function writePackageJson(pkgFile, pkgData) {
    await fs.writeFile(pkgFile, JSON.stringify(pkgData, null, 2) + '\n');
}

async function readPackageJson(pkgFile) {
    return JSON.parse(await fs.readFile(pkgFile, 'utf8'));
}

buildAll();
