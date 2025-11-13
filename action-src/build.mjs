#!/usr/bin/env node

// @ts-check

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
        supported: {
            'regexp-dot-all-flag': true,
            'regexp-lookbehind-assertions': true,
            'regexp-match-indices': true,
            'regexp-named-capture-groups': true,
            'regexp-set-notation': true,
            'regexp-sticky-and-unicode-flags': true,
            'regexp-unicode-property-escapes': true,
        },
    });
}

/**
 * @typedef {Object} PkgFile
 * @property {string[]} bundleDependencies
 * @property {Record<string, string>} dependencies
 */

/**
 * @returns {Promise<void>}
 */
async function syncPackage() {
    const pkgSrc = await readPackageJson(srcPackageFile);
    const pkgDst = await readPackageJson(dstPackageFile);

    const deps = pkgSrc['bundleDependencies'].map((dep) => [dep, pkgSrc.dependencies[dep]]);
    pkgDst.dependencies = Object.fromEntries(deps);
    pkgDst.bundleDependencies = pkgSrc.bundleDependencies;

    await writePackageJson(dstPackageFile, pkgDst);
}

/**
 * @returns {Promise<void>}
 */
async function buildAll() {
    await buildLib();
    await syncPackage();
}

/**
 *
 * @param {string} pkgFile
 * @param {PkgFile} pkgData
 */
async function writePackageJson(pkgFile, pkgData) {
    await fs.writeFile(pkgFile, JSON.stringify(pkgData, null, 2) + '\n');
}

/**
 *
 * @param {string} pkgFile
 * @returns {Promise<PkgFile>}
 */
async function readPackageJson(pkgFile) {
    return JSON.parse(await fs.readFile(pkgFile, 'utf8'));
}

buildAll();
