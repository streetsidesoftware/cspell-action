"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentValidator = void 0;
const cspell_pipe_1 = require("@cspell/cspell-pipe");
const assert_1 = __importDefault(require("assert"));
const TextDocument_1 = require("../Models/TextDocument");
const Settings_1 = require("../Settings");
const configLoader_1 = require("../Settings/configLoader");
const SpellingDictionary_1 = require("../SpellingDictionary");
const errors_1 = require("../util/errors");
const Memorizer_1 = require("../util/Memorizer");
const simpleCache_1 = require("../util/simpleCache");
const timer_1 = require("../util/timer");
const util_1 = require("../util/util");
const determineTextDocumentSettings_1 = require("./determineTextDocumentSettings");
const textValidator_1 = require("./textValidator");
const validator_1 = require("./validator");
class DocumentValidator {
    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc, options, settings) {
        this.options = options;
        this.settings = settings;
        this._ready = false;
        this.errors = [];
        this._preparationTime = -1;
        this._suggestions = new simpleCache_1.AutoCache((text) => this.genSuggestions(text), 1000);
        this._document = doc;
        // console.error(`DocumentValidator: ${doc.uri}`);
    }
    get ready() {
        return this._ready;
    }
    prepareSync() {
        var _a, _b;
        // @todo
        // Determine doc settings.
        // Calc include ranges
        // Load dictionaries
        if (this._ready)
            return;
        const timer = (0, timer_1.createTimer)();
        const { options, settings } = this;
        const useSearchForConfig = (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
        const optionsConfigFile = options.configFile;
        const localConfig = optionsConfigFile
            ? this.errorCatcherWrapper(() => (0, configLoader_1.loadConfigSync)(optionsConfigFile, settings))
            : useSearchForConfig
                ? this.errorCatcherWrapper(() => searchForDocumentConfigSync(this._document, settings, settings))
                : undefined;
        this.addPossibleError((_a = localConfig === null || localConfig === void 0 ? void 0 : localConfig.__importRef) === null || _a === void 0 ? void 0 : _a.error);
        const config = (0, Settings_1.mergeSettings)(settings, localConfig);
        const docSettings = (0, determineTextDocumentSettings_1.determineTextDocumentSettings)(this._document, config);
        const dict = (0, SpellingDictionary_1.getDictionaryInternalSync)(docSettings);
        const shouldCheck = (_b = docSettings.enabled) !== null && _b !== void 0 ? _b : true;
        const finalSettings = (0, Settings_1.finalizeSettings)(docSettings);
        const validateOptions = (0, validator_1.settingsToValidateOptions)(finalSettings);
        const includeRanges = (0, textValidator_1.calcTextInclusionRanges)(this._document.text, validateOptions);
        const segmenter = (0, textValidator_1.mapLineSegmentAgainstRangesFactory)(includeRanges);
        const lineValidator = (0, textValidator_1.lineValidatorFactory)(dict, validateOptions);
        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };
        this._ready = true;
        this._preparationTime = timer.elapsed();
        // console.error(`prepareSync ${this._preparationTime.toFixed(2)}ms`);
    }
    async prepare() {
        if (this._ready)
            return;
        if (this._prepared)
            return this._prepared;
        this._prepared = this._prepareAsync();
        return this._prepared;
    }
    async _prepareAsync() {
        var _a, _b;
        (0, assert_1.default)(!this._ready);
        const timer = (0, timer_1.createTimer)();
        const { options, settings } = this;
        const useSearchForConfig = (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
        const pLocalConfig = options.configFile
            ? this.catchError((0, Settings_1.loadConfig)(options.configFile, settings))
            : useSearchForConfig
                ? this.catchError(searchForDocumentConfig(this._document, settings, settings))
                : undefined;
        const localConfig = (await pLocalConfig) || {};
        this.addPossibleError((_a = localConfig === null || localConfig === void 0 ? void 0 : localConfig.__importRef) === null || _a === void 0 ? void 0 : _a.error);
        const config = (0, Settings_1.mergeSettings)(settings, localConfig);
        const docSettings = (0, determineTextDocumentSettings_1.determineTextDocumentSettings)(this._document, config);
        const dict = await (0, SpellingDictionary_1.getDictionaryInternal)(docSettings);
        const shouldCheck = (_b = docSettings.enabled) !== null && _b !== void 0 ? _b : true;
        const finalSettings = (0, Settings_1.finalizeSettings)(docSettings);
        const validateOptions = (0, validator_1.settingsToValidateOptions)(finalSettings);
        const includeRanges = (0, textValidator_1.calcTextInclusionRanges)(this._document.text, validateOptions);
        const segmenter = (0, textValidator_1.mapLineSegmentAgainstRangesFactory)(includeRanges);
        const lineValidator = (0, textValidator_1.lineValidatorFactory)(dict, validateOptions);
        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };
        this._ready = true;
        this._preparationTime = timer.elapsed();
    }
    _updatePrep() {
        var _a;
        (0, assert_1.default)(this._preparations);
        const timer = (0, timer_1.createTimer)();
        const { config } = this._preparations;
        const docSettings = (0, determineTextDocumentSettings_1.determineTextDocumentSettings)(this._document, config);
        const dict = (0, SpellingDictionary_1.getDictionaryInternalSync)(docSettings);
        const shouldCheck = (_a = docSettings.enabled) !== null && _a !== void 0 ? _a : true;
        const finalSettings = (0, Settings_1.finalizeSettings)(docSettings);
        const validateOptions = (0, validator_1.settingsToValidateOptions)(finalSettings);
        const includeRanges = (0, textValidator_1.calcTextInclusionRanges)(this._document.text, validateOptions);
        const segmenter = (0, textValidator_1.mapLineSegmentAgainstRangesFactory)(includeRanges);
        const lineValidator = (0, textValidator_1.lineValidatorFactory)(dict, validateOptions);
        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };
        this._preparationTime = timer.elapsed();
    }
    /**
     * The amount of time in ms to prepare for validation.
     */
    get prepTime() {
        return this._preparationTime;
    }
    checkText(range, _text, _scope) {
        (0, assert_1.default)(this._ready);
        (0, assert_1.default)(this._preparations);
        const { segmenter, lineValidator } = this._preparations;
        // Determine settings for text range
        // Slice text based upon include ranges
        // Check text against dictionaries.
        const offset = range[0];
        const offsetEnd = range[1];
        const text = this._document.text.slice(offset, offsetEnd);
        const line = this._document.lineAt(offset);
        const lineSeg = {
            line,
            segment: {
                text,
                offset,
            },
        };
        const aIssues = (0, cspell_pipe_1.pipeSync)(segmenter(lineSeg), (0, cspell_pipe_1.opConcatMap)(lineValidator));
        const issues = [...aIssues];
        if (!this.options.generateSuggestions) {
            return issues;
        }
        const withSugs = issues.map((t) => {
            // lazy suggestion calculation.
            const text = t.text;
            const suggestions = (0, Memorizer_1.callOnce)(() => this.suggest(text));
            return Object.defineProperty({ ...t }, 'suggestions', { enumerable: true, get: suggestions });
        });
        return withSugs;
    }
    get document() {
        return this._document;
    }
    updateDocumentText(text) {
        (0, TextDocument_1.updateTextDocument)(this._document, [{ text }]);
        this._updatePrep();
    }
    addPossibleError(error) {
        if (!error)
            return;
        error = this.errors.push((0, errors_1.toError)(error));
    }
    catchError(p) {
        return p.catch((error) => {
            this.addPossibleError(error);
            return undefined;
        });
    }
    errorCatcherWrapper(fn) {
        try {
            return fn();
        }
        catch (error) {
            this.addPossibleError(error);
        }
        return undefined;
    }
    suggest(text) {
        return this._suggestions.get(text);
    }
    genSuggestions(text) {
        var _a;
        (0, assert_1.default)(this._preparations);
        const settings = this._preparations.docSettings;
        const dict = this._preparations.dictionary;
        const sugOptions = (0, util_1.clean)({
            compoundMethod: 0,
            numSuggestions: this.options.numSuggestions,
            includeTies: false,
            ignoreCase: !((_a = settings.caseSensitive) !== null && _a !== void 0 ? _a : false),
            timeout: settings.suggestionsTimeout,
            numChanges: settings.suggestionNumChanges,
        });
        return dict.suggest(text, sugOptions).map((r) => r.word);
    }
}
exports.DocumentValidator = DocumentValidator;
async function searchForDocumentConfig(document, defaultConfig, pnpSettings) {
    const { uri } = document;
    if (uri.scheme !== 'file')
        return Promise.resolve(defaultConfig);
    return (0, Settings_1.searchForConfig)(uri.fsPath, pnpSettings).then((s) => s || defaultConfig);
}
function searchForDocumentConfigSync(document, defaultConfig, pnpSettings) {
    const { uri } = document;
    if (uri.scheme !== 'file')
        defaultConfig;
    return (0, configLoader_1.searchForConfigSync)(uri.fsPath, pnpSettings) || defaultConfig;
}
//# sourceMappingURL=docValidator.js.map