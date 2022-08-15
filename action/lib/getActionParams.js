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
exports.getActionParams = void 0;
const core = __importStar(require("@actions/core"));
const ActionParams_1 = require("./ActionParams");
function getActionParams() {
    return (0, ActionParams_1.applyDefaults)({
        github_token: core.getInput('github_token', { required: true }),
        files: core.getInput('files'),
        incremental_files_only: tf(core.getInput('incremental_files_only')),
        config: core.getInput('config'),
        root: core.getInput('root'),
        inline: core.getInput('inline').toLowerCase(),
        strict: tf(core.getInput('strict')),
        verbose: tf(core.getInput('verbose')),
        check_dot_files: tf(core.getInput('check_dot_files')),
    });
}
exports.getActionParams = getActionParams;
function tf(v) {
    const mapValues = {
        true: 'true',
        t: 'true',
        false: 'false',
        f: 'false',
        '0': 'false',
        '1': 'true',
    };
    v = typeof v === 'boolean' || typeof v === 'number' ? (v ? 'true' : 'false') : v;
    v = v.toString();
    v = v.toLowerCase();
    v = mapValues[v] || v;
    return v;
}
