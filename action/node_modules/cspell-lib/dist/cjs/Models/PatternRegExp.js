"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternRegExp = void 0;
class PatternRegExp extends RegExp {
    constructor(pattern) {
        super(pattern);
    }
    toJSON() {
        return this.toString();
    }
}
exports.PatternRegExp = PatternRegExp;
//# sourceMappingURL=PatternRegExp.js.map