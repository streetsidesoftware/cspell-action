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
exports.__testing__ = exports.testing = exports.refreshCacheEntries = exports.loadDictionarySync = exports.loadDictionary = void 0;
const fs_1 = require("fs");
const gensequence_1 = require("gensequence");
const path = __importStar(require("path"));
const util_1 = require("util");
const errors_1 = require("../util/errors");
const fileReader_1 = require("../util/fileReader");
const createSpellingDictionary_1 = require("./createSpellingDictionary");
const SpellingDictionaryError_1 = require("./SpellingDictionaryError");
const SpellingDictionaryFromTrie_1 = require("./SpellingDictionaryFromTrie");
const MAX_AGE = 10000;
const loaders = {
    S: loadSimpleWordList,
    C: legacyWordList,
    W: wordsPerLineWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};
const loadersSync = {
    S: loadSimpleWordListSync,
    C: legacyWordListSync,
    W: wordsPerLineWordListSync,
    T: loadTrieSync,
    default: loadSimpleWordListSync,
};
var LoadingState;
(function (LoadingState) {
    LoadingState[LoadingState["Loaded"] = 0] = "Loaded";
    LoadingState[LoadingState["Loading"] = 1] = "Loading";
})(LoadingState || (LoadingState = {}));
const debugLog = [];
const debugMode = false;
function __log(msg) {
    debugMode && debugLog.push(msg);
}
const dictionaryCache = new Map();
const dictionaryCacheByDef = new Map();
function getCacheEntry(def) {
    const defEntry = dictionaryCacheByDef.get(def);
    if (defEntry) {
        return defEntry;
    }
    const key = calcKey(def);
    const entry = dictionaryCache.get(key);
    if (entry) {
        // replace old entry so it can be released.
        entry.options = def;
    }
    return { key, entry };
}
function setCacheEntry(key, entry, def) {
    dictionaryCache.set(key, entry);
    dictionaryCacheByDef.set(def, { key, entry });
}
function loadDictionary(def) {
    const { key, entry } = getCacheEntry(def);
    if (entry) {
        return entry.pending.then(([dictionary]) => dictionary);
    }
    const loadedEntry = loadEntry(def.path, def);
    setCacheEntry(key, loadedEntry, def);
    return loadedEntry.pending.then(([dictionary]) => dictionary);
}
exports.loadDictionary = loadDictionary;
function loadDictionarySync(def) {
    const { key, entry } = getCacheEntry(def);
    if ((entry === null || entry === void 0 ? void 0 : entry.dictionary) && entry.loadingState === LoadingState.Loaded) {
        return entry.dictionary;
    }
    const loadedEntry = loadEntrySync(def.path, def);
    setCacheEntry(key, loadedEntry, def);
    return loadedEntry.dictionary;
}
exports.loadDictionarySync = loadDictionarySync;
const importantOptionKeys = ['name', 'noSuggest', 'useCompounds', 'type'];
function calcKey(def) {
    const path = def.path;
    const loaderType = determineType(path, def);
    const optValues = importantOptionKeys.map((k) => { var _a; return ((_a = def[k]) === null || _a === void 0 ? void 0 : _a.toString()) || ''; });
    const parts = [path, loaderType].concat(optValues);
    return parts.join('|');
}
/**
 * Check to see if any of the cached dictionaries have changed. If one has changed, reload it.
 * @param maxAge - Only check the dictionary if it has been at least `maxAge` ms since the last check.
 * @param now - optional timestamp representing now. (Mostly used in testing)
 */
async function refreshCacheEntries(maxAge = MAX_AGE, now = Date.now()) {
    await Promise.all([...dictionaryCache.values()].map((entry) => refreshEntry(entry, maxAge, now)));
}
exports.refreshCacheEntries = refreshCacheEntries;
async function refreshEntry(entry, maxAge, now) {
    if (now - entry.ts >= maxAge) {
        const sig = now + Math.random();
        // Write to the ts, so the next one will not do it.
        entry.sig = sig;
        entry.ts = now;
        const pStat = getStat(entry.uri);
        const [newStat] = await Promise.all([pStat, entry.pending]);
        const hasChanged = !isEqual(newStat, entry.stat);
        const sigMatches = entry.sig === sig;
        // if (entry.options.name === 'temp') {
        //     const processedAt = Date.now();
        //     __log(
        //         `Refresh ${entry.options.name}; sig: ${sig.toFixed(
        //             2
        //         )} at ${processedAt}; Sig Matches: ${sigMatches.toString()}; changed: ${hasChanged.toString()}; file: ${path.relative(
        //             process.cwd(),
        //             entry.uri
        //         )}`
        //     );
        // }
        if (sigMatches && hasChanged) {
            entry.loadingState = LoadingState.Loading;
            const key = calcKey(entry.options);
            const newEntry = loadEntry(entry.uri, entry.options);
            dictionaryCache.set(key, newEntry);
            dictionaryCacheByDef.set(entry.options, { key, entry: newEntry });
        }
    }
}
function isEqual(a, b) {
    if (!b)
        return false;
    if (isError(a)) {
        return isError(b) && a.message === b.message && a.name === b.name;
    }
    return !isError(b) && (a.mtimeMs === b.mtimeMs || a.size === b.size);
}
function isError(e) {
    const err = e;
    return !!err.message;
}
function loadEntry(uri, options, now = Date.now()) {
    const pDictionary = load(uri, options).catch((e) => (0, createSpellingDictionary_1.createFailedToLoadDictionary)(new SpellingDictionaryError_1.SpellingDictionaryLoadError(uri, options, e, 'failed to load')));
    const pStat = getStat(uri);
    const pending = Promise.all([pDictionary, pStat]);
    const sig = now + Math.random();
    const entry = {
        uri,
        options,
        ts: now,
        stat: undefined,
        dictionary: undefined,
        pending,
        loadingState: LoadingState.Loading,
        sig,
    };
    // eslint-disable-next-line promise/catch-or-return
    pending.then(([dictionary, stat]) => {
        entry.stat = stat;
        entry.dictionary = dictionary;
        entry.loadingState = LoadingState.Loaded;
        return;
    });
    return entry;
}
function loadEntrySync(uri, options, now = Date.now()) {
    const stat = getStatSync(uri);
    const sig = now + Math.random();
    try {
        const dictionary = loadSync(uri, options);
        const pending = Promise.resolve([dictionary, stat]);
        return {
            uri,
            options,
            ts: now,
            stat,
            dictionary,
            pending,
            loadingState: LoadingState.Loaded,
            sig,
        };
    }
    catch (e) {
        const error = e instanceof Error ? e : new Error((0, util_1.format)(e));
        const dictionary = (0, createSpellingDictionary_1.createFailedToLoadDictionary)(new SpellingDictionaryError_1.SpellingDictionaryLoadError(uri, options, error, 'failed to load'));
        const pending = Promise.resolve([dictionary, stat]);
        return {
            uri,
            options,
            ts: now,
            stat,
            dictionary,
            pending,
            loadingState: LoadingState.Loaded,
            sig,
        };
    }
}
function determineType(uri, opts) {
    const t = (opts.type && opts.type in loaders && opts.type) || 'S';
    const defLoaderType = t;
    const defType = uri.endsWith('.trie.gz') ? 'T' : defLoaderType;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : defType;
}
function load(uri, options) {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(uri, options);
}
function loadSync(uri, options) {
    const type = determineType(uri, options);
    const loader = loadersSync[type] || loaders.default;
    return loader(uri, options);
}
async function legacyWordList(filename, options) {
    const lines = await (0, fileReader_1.readLines)(filename);
    return _legacyWordListSync(lines, filename, options);
}
function legacyWordListSync(filename, options) {
    const lines = (0, fileReader_1.readLinesSync)(filename);
    return _legacyWordListSync(lines, filename, options);
}
function _legacyWordListSync(lines, filename, options) {
    const words = (0, gensequence_1.genSequence)(lines)
        // Remove comments
        .map((line) => line.replace(/#.*/g, ''))
        // Split on everything else
        .concatMap((line) => line.split(/[^\w\p{L}\p{M}'’]+/gu))
        .filter((word) => !!word);
    return (0, createSpellingDictionary_1.createSpellingDictionary)(words, determineName(filename, options), filename, options);
}
async function wordsPerLineWordList(filename, options) {
    const lines = await (0, fileReader_1.readLines)(filename);
    return _wordsPerLineWordList(lines, filename, options);
}
function wordsPerLineWordListSync(filename, options) {
    const lines = (0, fileReader_1.readLinesSync)(filename);
    return _wordsPerLineWordList(lines, filename, options);
}
function _wordsPerLineWordList(lines, filename, options) {
    const words = (0, gensequence_1.genSequence)(lines)
        // Remove comments
        .map((line) => line.replace(/#.*/g, ''))
        // Split on everything else
        .concatMap((line) => line.split(/\s+/gu))
        .filter((word) => !!word);
    return (0, createSpellingDictionary_1.createSpellingDictionary)(words, determineName(filename, options), filename, options);
}
async function loadSimpleWordList(filename, options) {
    const lines = await (0, fileReader_1.readLines)(filename);
    return (0, createSpellingDictionary_1.createSpellingDictionary)(lines, determineName(filename, options), filename, options);
}
function loadSimpleWordListSync(filename, options) {
    const lines = (0, fileReader_1.readLinesSync)(filename);
    return (0, createSpellingDictionary_1.createSpellingDictionary)(lines, determineName(filename, options), filename, options);
}
async function loadTrie(filename, options) {
    const lines = await (0, fileReader_1.readLines)(filename);
    return (0, SpellingDictionaryFromTrie_1.createSpellingDictionaryTrie)(lines, determineName(filename, options), filename, options);
}
function loadTrieSync(filename, options) {
    const lines = (0, fileReader_1.readLinesSync)(filename);
    return (0, SpellingDictionaryFromTrie_1.createSpellingDictionaryTrie)(lines, determineName(filename, options), filename, options);
}
function determineName(filename, options) {
    return options.name || path.basename(filename);
}
exports.testing = {
    dictionaryCache,
    refreshEntry,
    loadEntry,
    load,
};
function toError(e) {
    if ((0, errors_1.isErrnoException)(e))
        return e;
    if (e instanceof Error)
        return e;
    return new Error((0, util_1.format)(e));
}
function getStat(uri) {
    return fs_1.promises.stat(uri).catch((e) => toError(e));
}
function getStatSync(uri) {
    try {
        return (0, fs_1.statSync)(uri);
    }
    catch (e) {
        return toError(e);
    }
}
exports.__testing__ = {
    debugLog,
};
//# sourceMappingURL=DictionaryLoader.js.map