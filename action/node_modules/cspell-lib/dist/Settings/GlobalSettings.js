"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalConfigPath = exports.writeRawGlobalSettings = exports.getRawGlobalSettings = void 0;
const configstore_1 = __importDefault(require("configstore"));
const util_1 = require("util");
const errors_1 = require("../util/errors");
const logger_1 = require("../util/logger");
const packageName = 'cspell';
function getRawGlobalSettings() {
    const name = 'CSpell Configstore';
    const globalConf = {
        source: {
            name,
            filename: undefined,
        },
    };
    try {
        const cfgStore = new configstore_1.default(packageName);
        const cfg = cfgStore.all;
        // Only populate globalConf is there are values.
        if (cfg && Object.keys(cfg).length) {
            Object.assign(globalConf, cfg);
            globalConf.source = {
                name,
                filename: cfgStore.path,
            };
        }
    }
    catch (error) {
        if (!(0, errors_1.isErrnoException)(error) ||
            !error.code ||
            !['ENOENT', 'EACCES', 'ENOTDIR', 'EISDIR'].includes(error.code)) {
            (0, logger_1.logError)(error);
        }
    }
    return globalConf;
}
exports.getRawGlobalSettings = getRawGlobalSettings;
function writeRawGlobalSettings(settings) {
    const toWrite = {
        import: settings.import,
    };
    try {
        const cfgStore = new configstore_1.default(packageName);
        cfgStore.set(toWrite);
        return undefined;
    }
    catch (error) {
        if (error instanceof Error)
            return error;
        return new Error((0, util_1.format)(error));
    }
}
exports.writeRawGlobalSettings = writeRawGlobalSettings;
function getGlobalConfigPath() {
    const cfgStore = new configstore_1.default(packageName);
    return cfgStore.path;
}
exports.getGlobalConfigPath = getGlobalConfigPath;
//# sourceMappingURL=GlobalSettings.js.map