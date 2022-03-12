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
exports.extractSettingsFromText = exports.combineTextAndLanguageSettings = void 0;
const CSpellSettingsServer = __importStar(require("./CSpellSettingsServer"));
const InDocSettings_1 = require("./InDocSettings");
const LanguageSettings_1 = require("./LanguageSettings");
function combineTextAndLanguageSettings(settings, text, languageId) {
    const docSettings = extractSettingsFromText(text);
    const settingsForText = CSpellSettingsServer.mergeSettings(settings, docSettings);
    const langSettings = (0, LanguageSettings_1.calcSettingsForLanguageId)(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return CSpellSettingsServer.mergeSettings(langSettings, docSettings);
}
exports.combineTextAndLanguageSettings = combineTextAndLanguageSettings;
function extractSettingsFromText(text) {
    return (0, InDocSettings_1.getInDocumentSettings)(text);
}
exports.extractSettingsFromText = extractSettingsFromText;
//# sourceMappingURL=TextDocumentSettings.js.map