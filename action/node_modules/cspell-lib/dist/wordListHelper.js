"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitLineIntoWords = exports.splitLineIntoCodeWords = exports.splitCodeWords = exports.splitLine = exports.loadWordsNoError = void 0;
// cSpell:enableCompoundWords
const fileReader_1 = require("./util/fileReader");
const iterableIteratorLib_1 = require("./util/iterableIteratorLib");
const logger_1 = require("./util/logger");
const Text = __importStar(require("./util/text"));
const regExpWordsWithSpaces = /^\s*\p{L}+(?:\s+\p{L}+){0,3}$/u;
/**
 * Reads words from a file. It will not throw and error.
 * @param filename the file to read
 */
function loadWordsNoError(filename) {
    return (0, fileReader_1.readLines)(filename).catch((e) => ((0, logger_1.logError)(e), (0, iterableIteratorLib_1.toIterableIterator)([])));
}
exports.loadWordsNoError = loadWordsNoError;
function splitLine(line) {
    return [...Text.extractWordsFromText(line)].map(({ text }) => text);
}
exports.splitLine = splitLine;
function splitCodeWords(words) {
    return words.map(Text.splitCamelCaseWord).reduce((a, b) => a.concat(b), []);
}
exports.splitCodeWords = splitCodeWords;
function splitLineIntoCodeWords(line) {
    const asMultiWord = regExpWordsWithSpaces.test(line) ? [line] : [];
    const asWords = splitLine(line);
    const splitWords = splitCodeWords(asWords);
    const wordsToAdd = new Set((0, iterableIteratorLib_1.concatIterables)(asMultiWord, asWords, splitWords));
    return (0, iterableIteratorLib_1.toIterableIterator)(wordsToAdd);
}
exports.splitLineIntoCodeWords = splitLineIntoCodeWords;
function splitLineIntoWords(line) {
    const asWords = splitLine(line);
    return (0, iterableIteratorLib_1.concatIterables)([line], asWords);
}
exports.splitLineIntoWords = splitLineIntoWords;
//# sourceMappingURL=wordListHelper.js.map