#!/usr/bin/env node

'use strict';

import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcPkgFilename = path.resolve(__dirname, 'action-src/package.json');
const dstPkgFilename = path.resolve(__dirname, 'action/package.json');

console.log('Synchronize the dependencies with action-src');

const srcPkg = JSON.parse(fs.readFileSync(srcPkgFilename, 'utf-8'));
const dstPkg = JSON.parse(fs.readFileSync(dstPkgFilename, 'utf-8'));

const origDep = dstPkg.dependencies;
const orig = JSON.stringify(origDep, undefined, 2);

dstPkg.dependencies = srcPkg.dependencies;

const updated = JSON.stringify(dstPkg.dependencies, undefined, 2);

if (updated !== orig) {

    console.log('Updating from %o to %o', origDep, dstPkg.dependencies);
    fs.writeFileSync(dstPkgFilename, JSON.stringify(dstPkg, undefined, 2) + '\n');
} else {
    console.log('already in sync.')
}

console.log('done.')
