#!/usr/bin/env node

/**
 * This file was copied from vscode-languageserver `installServerIntoExtension.js`
 */

var path = require('path');
var fs = require('fs');
var cp = require('child_process');

const usage = 'Usage: ./installAction.js targetDir package.json tsconfig.json [package-lock.json | npm-shrinkwrap.json]';

var targetDirectory = process.argv[2];
if (!targetDirectory) {
	console.error('No extension directory provided.');
    console.error(usage);
	process.exit(1)
}
targetDirectory = path.resolve(targetDirectory)
if (!fs.existsSync(targetDirectory)) {
    console.error('Target directory ' + targetDirectory + ' doesn\'t exist on disk.');
    console.error(usage);
	process.exit(1);
}

var packageFile = process.argv[3];
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
var tsconfigFile = process.argv[4];
if (!tsconfigFile) {
	console.error('No tsconfig.json file provided');
    console.error(usage);
	process.exit(1);
}
tsconfigFile = path.resolve(tsconfigFile);
if (!fs.existsSync(tsconfigFile)) {
	console.error('tsconfig file ' + tsconfigFile + ' doesn\'t exist on disk.')
    console.error(usage);
	process.exit(1);
}

var actionDirectory = path.join(targetDirectory, 'action')

var json = require(tsconfigFile);
var compilerOptions = json.compilerOptions;
if (compilerOptions) {
	var outDir = compilerOptions.outDir;
	if (!outDir || path.join(path.dirname(tsconfigFile), outDir) !== actionDirectory) {
		console.error('outDir in ' + process.argv[4] + ' must point to ' + actionDirectory + ' but it points to ' + path.join(path.dirname(tsconfigFile), outDir));
		console.error('Please change outDir in ' + process.argv[4] + ' to ' + path.relative(path.dirname(tsconfigFile), actionDirectory).replace(/\\/g, '/'));
        console.error(usage);
		process.exit(1);
	}
}

if (!fs.existsSync(actionDirectory)) {
	fs.mkdirSync(actionDirectory);
}

var dest = path.join(actionDirectory, 'package.json');
console.log('Copying package.json to action\'s location...');
fs.writeFileSync(dest, fs.readFileSync(packageFile));

var shrinkwrapFile = process.argv[5];
if (fs.existsSync(shrinkwrapFile)) {
	const shrinkWrapDest = path.join(actionDirectory, 'npm-shrinkwrap.json');
	shrinkwrapFile = path.resolve(shrinkwrapFile);
	console.log('Copying npm-shrinkwrap.json to action\'s location...');
	fs.writeFileSync(shrinkWrapDest, fs.readFileSync(shrinkwrapFile));

}

console.log('Updating Action npm modules into action\'s location...');
cp.execSync('npm update --production --prefix ' + actionDirectory);
