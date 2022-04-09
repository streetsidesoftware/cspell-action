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
exports.__testing__ = exports.DiskCache = void 0;
const crypto = __importStar(require("crypto"));
const fileEntryCache = __importStar(require("file-entry-cache"));
const fs = __importStar(require("fs"));
const path_1 = require("path");
const fileHelper_1 = require("../../util/fileHelper");
const ObjectCollection_1 = require("./ObjectCollection");
const cacheDataKeys = {
    v: 'v',
    r: 'r',
    d: 'd',
};
/**
 * Meta Data Version is used to detect if the structure of the meta data has changed.
 * This is used in combination with the Suffix and the version of CSpell.
 */
const META_DATA_BASE_VERSION = '1';
const META_DATA_VERSION_SUFFIX = '-' + META_DATA_BASE_VERSION + '-' + Object.keys(cacheDataKeys).join('|');
/**
 * Caches cspell results on disk
 */
class DiskCache {
    constructor(cacheFileLocation, useCheckSum, cspellVersion) {
        this.useCheckSum = useCheckSum;
        this.cspellVersion = cspellVersion;
        this.dependencyCache = new Map();
        this.dependencyCacheTree = {};
        this.objectCollection = new ObjectCollection_1.ShallowObjectCollection();
        this.ocCacheFileResult = new ObjectCollection_1.ShallowObjectCollection();
        this.fileEntryCache = fileEntryCache.createFromFile((0, path_1.resolve)(cacheFileLocation), useCheckSum);
        this.version = calcVersion(cspellVersion);
    }
    async getCachedLintResults(filename) {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(filename);
        const meta = fileDescriptor.meta;
        const data = meta === null || meta === void 0 ? void 0 : meta.data;
        const result = data === null || data === void 0 ? void 0 : data.r;
        const versionMatches = this.version === (data === null || data === void 0 ? void 0 : data.v);
        // Cached lint results are valid if and only if:
        // 1. The file is present in the filesystem
        // 2. The file has not changed since the time it was previously linted
        // 3. The CSpell configuration has not changed since the time the file was previously linted
        // If any of these are not true, we will not reuse the lint results.
        if (fileDescriptor.notFound ||
            fileDescriptor.changed ||
            !meta ||
            !result ||
            !versionMatches ||
            !this.checkDependencies(data.d)) {
            return undefined;
        }
        const dd = { ...data };
        if (dd.d) {
            dd.d = setTreeEntry(this.dependencyCacheTree, dd.d);
        }
        dd.r = dd.r && this.normalizeResult(dd.r);
        meta.data = this.objectCollection.get(dd);
        // Skip reading empty files and files without lint error
        const hasErrors = !!result && (result.errors > 0 || result.configErrors > 0 || result.issues.length > 0);
        const cached = true;
        const shouldReadFile = cached && hasErrors;
        return {
            ...result,
            elapsedTimeMs: undefined,
            fileInfo: shouldReadFile ? await (0, fileHelper_1.readFileInfo)(filename) : { filename },
            cached,
        };
    }
    setCachedLintResults({ fileInfo, elapsedTimeMs: _, cached: __, ...result }, dependsUponFiles) {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(fileInfo.filename);
        const meta = fileDescriptor.meta;
        if (fileDescriptor.notFound || !meta) {
            return;
        }
        const data = this.objectCollection.get({
            v: this.version,
            r: this.normalizeResult(result),
            d: this.calcDependencyHashes(dependsUponFiles),
        });
        meta.data = data;
    }
    reconcile() {
        this.fileEntryCache.reconcile();
    }
    reset() {
        this.fileEntryCache.destroy();
        this.dependencyCache.clear();
        this.dependencyCacheTree = {};
        this.objectCollection = new ObjectCollection_1.ShallowObjectCollection();
        this.ocCacheFileResult = new ObjectCollection_1.ShallowObjectCollection();
    }
    normalizeResult(result) {
        const { issues, processed, errors, configErrors, ...rest } = result;
        if (!Object.keys(rest).length) {
            return this.ocCacheFileResult.get(result);
        }
        return this.ocCacheFileResult.get({ issues, processed, errors, configErrors });
    }
    calcDependencyHashes(dependsUponFiles) {
        dependsUponFiles.sort();
        const c = getTreeEntry(this.dependencyCacheTree, dependsUponFiles);
        if (c === null || c === void 0 ? void 0 : c.d) {
            return c.d;
        }
        const dependencies = dependsUponFiles.map((f) => this.getDependency(f));
        return setTreeEntry(this.dependencyCacheTree, dependencies);
    }
    checkDependency(dep) {
        const cDep = this.dependencyCache.get(dep.f);
        if (cDep && compDep(dep, cDep))
            return true;
        if (cDep)
            return false;
        const d = this.getFileDep(dep.f);
        if (compDep(dep, d)) {
            this.dependencyCache.set(dep.f, dep);
            return true;
        }
        this.dependencyCache.set(d.f, d);
        return false;
    }
    getDependency(file) {
        const dep = this.dependencyCache.get(file);
        if (dep)
            return dep;
        const d = this.getFileDep(file);
        this.dependencyCache.set(file, d);
        return d;
    }
    getFileDep(file) {
        let h;
        try {
            const buffer = fs.readFileSync(file);
            h = this.getHash(buffer);
        }
        catch (e) {
            return { f: file };
        }
        return { f: file, h };
    }
    checkDependencies(dependencies) {
        if (!dependencies)
            return false;
        for (const dep of dependencies) {
            if (!this.checkDependency(dep)) {
                return false;
            }
        }
        return true;
    }
    getHash(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }
}
exports.DiskCache = DiskCache;
function getTreeEntry(tree, keys) {
    var _a;
    let r = tree;
    for (const k of keys) {
        r = (_a = r.c) === null || _a === void 0 ? void 0 : _a.get(k);
        if (!r)
            return r;
    }
    return r;
}
function setTreeEntry(tree, deps, update = false) {
    let r = tree;
    for (const d of deps) {
        const k = d.f;
        if (!r.c) {
            r.c = new Map();
        }
        const cn = r.c.get(k);
        const n = cn !== null && cn !== void 0 ? cn : {};
        if (!cn) {
            r.c.set(k, n);
        }
        r = n;
    }
    let d = r.d;
    if (!d || (r.d && update)) {
        r.d = deps;
        d = deps;
    }
    return d;
}
function compDep(a, b) {
    return a.f === b.f && a.h === b.h;
}
function calcVersion(version) {
    return version + META_DATA_VERSION_SUFFIX;
}
exports.__testing__ = {
    calcVersion,
};
//# sourceMappingURL=DiskCache.js.map