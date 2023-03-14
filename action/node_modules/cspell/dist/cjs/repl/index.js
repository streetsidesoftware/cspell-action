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
exports.SimpleRepl = exports.simpleRepl = void 0;
const readline = __importStar(require("readline"));
function simpleRepl() {
    return new SimpleRepl();
}
exports.simpleRepl = simpleRepl;
class SimpleRepl {
    constructor(prompt = '> ') {
        this.prompt = prompt;
        this._history = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt,
            history: this._history,
            historySize: 100,
            completer: (line) => this._completer(line),
        });
        this.rl.on('history', (h) => ((this._history = h), undefined));
    }
    question(query) {
        return new Promise((resolve) => {
            this.rl.question(query, resolve);
        });
    }
    _completer(line) {
        // console.log('Complete: %s', line);
        // console.log('History: %o', this._history);
        if (this.completer)
            return this.completer(line);
        const hist = this._history.filter((h) => h.startsWith(line));
        return [hist, line];
    }
    get history() {
        return this._history;
    }
    [Symbol.asyncIterator]() {
        const next = () => {
            if (this.beforeEach)
                this.beforeEach();
            // console.log('%o', this.rl);
            return this.question(this.prompt)
                .then((value) => ({ value }))
                .catch(() => ({ done: true, value: undefined }));
        };
        return { next };
    }
}
exports.SimpleRepl = SimpleRepl;
//# sourceMappingURL=index.js.map