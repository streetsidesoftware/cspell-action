"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixLegacy = void 0;
function fixLegacy(opts) {
    const { local, ...rest } = opts;
    if (local && !rest.locale) {
        rest.locale = local;
    }
    return rest;
}
exports.fixLegacy = fixLegacy;
//# sourceMappingURL=options.js.map