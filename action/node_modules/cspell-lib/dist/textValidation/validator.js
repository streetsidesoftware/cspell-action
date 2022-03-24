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
exports.checkText = exports.IncludeExcludeFlag = exports.settingsToValidateOptions = exports.validateText = exports.diagSource = void 0;
const Settings = __importStar(require("../Settings"));
const SpellingDictionary_1 = require("../SpellingDictionary");
const Memorizer_1 = require("../util/Memorizer");
const util_1 = require("../util/util");
const textValidator_1 = require("./textValidator");
exports.diagSource = 'cSpell Checker';
async function validateText(text, settings, options = {}) {
    var _a;
    const finalSettings = Settings.finalizeSettings(settings);
    const dict = await (0, SpellingDictionary_1.getDictionaryInternal)(finalSettings);
    const issues = [...(0, textValidator_1.validateText)(text, dict, settingsToValidateOptions(finalSettings))];
    if (!options.generateSuggestions) {
        return issues;
    }
    const sugOptions = (0, util_1.clean)({
        numSuggestions: options.numSuggestions,
        compoundMethod: SpellingDictionary_1.CompoundWordsMethod.NONE,
        includeTies: false,
        ignoreCase: !((_a = settings.caseSensitive) !== null && _a !== void 0 ? _a : false),
        timeout: settings.suggestionsTimeout,
        numChanges: settings.suggestionNumChanges,
    });
    const withSugs = issues.map((t) => {
        const text = t.text;
        // lazy suggestion calculation.
        const suggestions = (0, Memorizer_1.callOnce)(() => dict.suggest(text, sugOptions).map((r) => r.word));
        return Object.defineProperty({ ...t }, 'suggestions', { enumerable: true, get: suggestions });
    });
    return withSugs;
}
exports.validateText = validateText;
function settingsToValidateOptions(settings) {
    var _a;
    const opt = {
        ...settings,
        ignoreCase: !((_a = settings.caseSensitive) !== null && _a !== void 0 ? _a : false),
    };
    return opt;
}
exports.settingsToValidateOptions = settingsToValidateOptions;
var IncludeExcludeFlag;
(function (IncludeExcludeFlag) {
    IncludeExcludeFlag["INCLUDE"] = "I";
    IncludeExcludeFlag["EXCLUDE"] = "E";
})(IncludeExcludeFlag = exports.IncludeExcludeFlag || (exports.IncludeExcludeFlag = {}));
async function checkText(text, settings) {
    const validationResult = validateText(text, settings);
    const finalSettings = Settings.finalizeSettings(settings);
    const includeRanges = (0, textValidator_1.calcTextInclusionRanges)(text, finalSettings);
    const result = [];
    let lastPos = 0;
    for (const { startPos, endPos } of includeRanges) {
        result.push({
            text: text.slice(lastPos, startPos),
            startPos: lastPos,
            endPos: startPos,
            flagIE: IncludeExcludeFlag.EXCLUDE,
        });
        result.push({
            text: text.slice(startPos, endPos),
            startPos,
            endPos,
            flagIE: IncludeExcludeFlag.INCLUDE,
        });
        lastPos = endPos;
    }
    result.push({
        text: text.slice(lastPos),
        startPos: lastPos,
        endPos: text.length,
        flagIE: IncludeExcludeFlag.EXCLUDE,
    });
    const issues = await validationResult;
    function* merge() {
        let i = 0;
        for (const r of result) {
            if (i >= issues.length || issues[i].offset >= r.endPos) {
                yield r;
                continue;
            }
            const span = { ...r };
            while (i < issues.length && issues[i].offset < span.endPos) {
                const issue = issues[i];
                const endPos = issue.offset;
                const text = span.text.slice(0, endPos - span.startPos);
                const endPosError = issue.offset + issue.text.length;
                yield { ...span, text, endPos };
                yield {
                    ...span,
                    isError: true,
                    startPos: issue.offset,
                    endPos: endPosError,
                    text: issue.text,
                };
                span.text = span.text.slice(endPosError - span.startPos);
                span.startPos = endPosError;
                i += 1;
            }
            yield span;
        }
    }
    return {
        text,
        items: [...merge()].filter((i) => i.startPos < i.endPos),
    };
}
exports.checkText = checkText;
//# sourceMappingURL=validator.js.map