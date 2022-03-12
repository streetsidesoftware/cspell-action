"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileToDocument = exports.isBinaryFile = exports.isBinaryDoc = exports.determineFinalDocumentSettings = exports.spellCheckDocument = exports.spellCheckFile = void 0;
const cspell_glob_1 = require("cspell-glob");
const fs_extra_1 = require("fs-extra");
const vscode_uri_1 = require("vscode-uri");
const determineTextDocumentSettings_1 = require("./textValidation/determineTextDocumentSettings");
const LanguageIds_1 = require("./LanguageIds");
const TextDocument_1 = require("./Models/TextDocument");
const Settings_1 = require("./Settings");
const errors_1 = require("./util/errors");
const util_1 = require("./util/util");
const validator_1 = require("./validator");
const defaultEncoding = 'utf8';
/**
 * Spell Check a file
 * @param file - absolute path to file to read and check.
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
function spellCheckFile(file, options, settings) {
    const doc = {
        uri: vscode_uri_1.URI.file(file).toString(),
    };
    return spellCheckDocument(doc, options, settings);
}
exports.spellCheckFile = spellCheckFile;
/**
 * Spell Check a Document.
 * @param document - document to be checked. If `document.text` is `undefined` the file will be loaded
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
async function spellCheckDocument(document, options, settings) {
    if (isBinaryDoc(document)) {
        return {
            document,
            options,
            settingsUsed: settings,
            localConfigFilepath: undefined,
            issues: [],
            checked: false,
            errors: undefined,
        };
    }
    try {
        return spellCheckFullDocument(await resolveDocument(document), options, settings);
    }
    catch (e) {
        const errors = (0, errors_1.isError)(e) ? [e] : [];
        return {
            document,
            options,
            settingsUsed: settings,
            localConfigFilepath: undefined,
            issues: [],
            checked: false,
            errors,
        };
    }
}
exports.spellCheckDocument = spellCheckDocument;
async function spellCheckFullDocument(document, options, settings) {
    var _a, _b, _c, _d;
    const errors = [];
    function addPossibleError(error) {
        if (!error)
            return;
        errors.push(error);
    }
    function catchError(p) {
        return p.catch((error) => {
            addPossibleError(error);
            return undefined;
        });
    }
    const useSearchForConfig = (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
    const pLocalConfig = options.configFile
        ? catchError((0, Settings_1.loadConfig)(options.configFile, settings))
        : useSearchForConfig
            ? catchError(searchForDocumentConfig(document, settings, settings))
            : undefined;
    const localConfig = await pLocalConfig;
    addPossibleError((_a = localConfig === null || localConfig === void 0 ? void 0 : localConfig.__importRef) === null || _a === void 0 ? void 0 : _a.error);
    if (errors.length) {
        return {
            document,
            options,
            settingsUsed: localConfig || settings,
            localConfigFilepath: (_b = localConfig === null || localConfig === void 0 ? void 0 : localConfig.__importRef) === null || _b === void 0 ? void 0 : _b.filename,
            issues: [],
            checked: false,
            errors,
        };
    }
    const matcher = new cspell_glob_1.GlobMatcher((localConfig === null || localConfig === void 0 ? void 0 : localConfig.ignorePaths) || [], { root: process.cwd(), dot: true });
    const config = localConfig ? (0, Settings_1.mergeSettings)(settings, localConfig) : settings;
    const docSettings = determineFinalDocumentSettings(document, config);
    const uri = vscode_uri_1.URI.parse(document.uri);
    const shouldCheck = !matcher.match(uri.fsPath) && ((_c = docSettings.settings.enabled) !== null && _c !== void 0 ? _c : true);
    const { generateSuggestions, numSuggestions } = options;
    const validateOptions = (0, util_1.clean)({ generateSuggestions, numSuggestions });
    const issues = shouldCheck ? await (0, validator_1.validateText)(document.text, docSettings.settings, validateOptions) : [];
    const result = {
        document,
        options,
        settingsUsed: docSettings.settings,
        localConfigFilepath: (_d = localConfig === null || localConfig === void 0 ? void 0 : localConfig.__importRef) === null || _d === void 0 ? void 0 : _d.filename,
        issues,
        checked: shouldCheck,
        errors: undefined,
    };
    return result;
}
async function searchForDocumentConfig(document, defaultConfig, pnpSettings) {
    const { uri } = document;
    const u = vscode_uri_1.URI.parse(uri);
    if (u.scheme !== 'file')
        return Promise.resolve(defaultConfig);
    return (0, Settings_1.searchForConfig)(u.fsPath, pnpSettings).then((s) => s || defaultConfig);
}
async function readDocument(filename, encoding = defaultEncoding) {
    const text = await (0, fs_extra_1.readFile)(filename, encoding);
    const uri = vscode_uri_1.URI.file(filename).toString();
    return {
        uri,
        text,
    };
}
function resolveDocument(document, encoding) {
    if (isDocumentWithText(document))
        return Promise.resolve(document);
    const uri = vscode_uri_1.URI.parse(document.uri);
    if (uri.scheme !== 'file') {
        throw new Error(`Unsupported schema: "${uri.scheme}", open "${uri.toString()}"`);
    }
    return readDocument(uri.fsPath, encoding);
}
function isDocumentWithText(doc) {
    return doc.text !== undefined;
}
/**
 * Combines all relevant setting values into a final configuration to be used for spell checking.
 * It applies any overrides and appropriate language settings by taking into account the document type (languageId)
 * the locale (natural language) and any in document settings.
 *
 * Note: this method will not search for configuration files. Configuration files should already be merged into `settings`.
 * It is NOT necessary to include the cspell defaultSettings or globalSettings. They will be applied within this function.
 * @param document - The document to be spell checked. Note: if the URI doesn't have a path, overrides cannot be applied.
 *   `locale` - if defined will be used unless it is overridden by an in-document setting.
 *   `languageId` - if defined will be used to select appropriate file type dictionaries.
 * @param settings - The near final settings. Should already be the combination of all configuration files.
 */
function determineFinalDocumentSettings(document, settings) {
    const doc = (0, TextDocument_1.createTextDocument)({
        uri: document.uri,
        content: document.text,
        languageId: document.languageId,
        locale: document.locale,
    });
    return {
        document,
        settings: (0, determineTextDocumentSettings_1.determineTextDocumentSettings)(doc, settings),
    };
}
exports.determineFinalDocumentSettings = determineFinalDocumentSettings;
function isBinaryDoc(document) {
    return isBinaryFile(vscode_uri_1.URI.parse(document.uri), document.languageId);
}
exports.isBinaryDoc = isBinaryDoc;
function isBinaryFile(filenameUri, languageId) {
    if (languageId) {
        const ids = normalizeLanguageIds(languageId);
        if (ids.length)
            return (0, LanguageIds_1.isGenerated)(ids);
    }
    const filename = vscode_uri_1.Utils.basename(filenameUri);
    return (0, LanguageIds_1.isGeneratedFile)(filename);
}
exports.isBinaryFile = isBinaryFile;
function normalizeLanguageIds(languageId) {
    return (Array.isArray(languageId) ? languageId.join(',') : languageId).split(',').map((s) => s.trim());
}
function fileToDocument(file, text, languageId, locale) {
    return (0, util_1.clean)({
        uri: vscode_uri_1.URI.file(file).toString(),
        text,
        languageId,
        locale,
    });
}
exports.fileToDocument = fileToDocument;
//# sourceMappingURL=spellCheckFile.js.map