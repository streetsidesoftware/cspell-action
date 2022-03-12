"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCSpellSettingsInternal = exports.createCSpellSettingsInternal = exports.SymbolCSpellSettingsInternal = void 0;
const util_1 = require("../util/util");
exports.SymbolCSpellSettingsInternal = Symbol('CSpellSettingsInternal');
function createCSpellSettingsInternal(parts = {}) {
    return (0, util_1.clean)({
        ...parts,
        [exports.SymbolCSpellSettingsInternal]: true,
    });
}
exports.createCSpellSettingsInternal = createCSpellSettingsInternal;
function isCSpellSettingsInternal(cs) {
    return !!cs[exports.SymbolCSpellSettingsInternal];
}
exports.isCSpellSettingsInternal = isCSpellSettingsInternal;
//# sourceMappingURL=CSpellSettingsInternalDef.js.map