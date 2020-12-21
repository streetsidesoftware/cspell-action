#!/usr/bin/env node
/**
 * This file was copied from vscode-languageserver `installServerIntoExtension.js`
 */

 /* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

const usage = 'Usage: ./installAction.js targetDir package.json';
let [, , targetDirectory, packageFile] = process.argv;


if (!targetDirectory) {
	console.error('No target directory provided.');
    console.error(usage);
	process.exit(1)
}
targetDirectory = path.resolve(targetDirectory)

if (!packageFile) {
	console.error('No package.json file provided.');
    console.error(usage);
	process.exit(1);
}
packageFile = path.resolve(packageFile);
if (!fs.existsSync(packageFile)) {
	console.error('Package file ' + packageFile + ' doesn\'t exist on disk.');
    console.error(usage);
	process.exit(1);
}

const actionDirectory = targetDirectory

if (!fs.existsSync(actionDirectory)) {
	fs.mkdirSync(actionDirectory);
}

const dest = path.join(actionDirectory, 'package.json');
console.log('Copying package.json to action\'s location...');
fs.writeFileSync(dest, fs.readFileSync(packageFile));

console.log('Updating Action npm modules into action\'s location...');
cp.execSync('npm update --production --prefix ' + actionDirectory);
