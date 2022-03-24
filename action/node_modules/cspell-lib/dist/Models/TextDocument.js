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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTextDocument = exports.createTextDocument = void 0;
const LanguageIds_1 = require("../LanguageIds");
const Uri = __importStar(require("./Uri"));
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const assert_1 = __importDefault(require("assert"));
class TextDocumentImpl {
    constructor(uri, text, languageId, locale, version) {
        this.uri = uri;
        this.languageId = languageId;
        this.locale = locale;
        const primaryLanguageId = typeof languageId === 'string' ? languageId : languageId[0] || 'plaintext';
        this.vsTextDoc = vscode_languageserver_textdocument_1.TextDocument.create(uri.toString(), primaryLanguageId, version, text);
    }
    get version() {
        return this.vsTextDoc.version;
    }
    get text() {
        return this.vsTextDoc.getText();
    }
    positionAt(offset) {
        return this.vsTextDoc.positionAt(offset);
    }
    offsetAt(position) {
        return this.vsTextDoc.offsetAt(position);
    }
    lineAt(offset) {
        const position = this.vsTextDoc.positionAt(offset);
        position.character = 0;
        const lineOffset = this.vsTextDoc.offsetAt(position);
        const range = {
            start: position,
            end: { line: position.line + 1, character: 0 },
        };
        let _text;
        const getText = () => this.vsTextDoc.getText(range);
        return {
            get text() {
                return _text !== null && _text !== void 0 ? _text : (_text = getText());
            },
            offset: lineOffset,
            position,
        };
    }
    /**
     * Apply edits to the text.
     * Note: the edits are applied one after the other.
     * @param edits - changes to the text
     * @param version - optional version to use.
     * @returns this
     */
    update(edits, version) {
        version = version !== null && version !== void 0 ? version : this.version + 1;
        for (const edit of edits) {
            const vsEdit = edit.range
                ? {
                    range: { start: this.positionAt(edit.range[0]), end: this.positionAt(edit.range[1]) },
                    text: edit.text,
                }
                : edit;
            vscode_languageserver_textdocument_1.TextDocument.update(this.vsTextDoc, [vsEdit], version);
        }
        return this;
    }
}
function createTextDocument({ uri, content, languageId, locale, version, }) {
    version = version !== null && version !== void 0 ? version : 1;
    uri = Uri.toUri(uri);
    languageId = languageId !== null && languageId !== void 0 ? languageId : (0, LanguageIds_1.getLanguagesForBasename)(Uri.basename(uri));
    languageId = languageId.length === 0 ? 'text' : languageId;
    return new TextDocumentImpl(uri, content, languageId, locale, version);
}
exports.createTextDocument = createTextDocument;
function updateTextDocument(doc, edits, version) {
    (0, assert_1.default)(doc instanceof TextDocumentImpl, 'Unknown TextDocument type');
    return doc.update(edits, version);
}
exports.updateTextDocument = updateTextDocument;
//# sourceMappingURL=TextDocument.js.map