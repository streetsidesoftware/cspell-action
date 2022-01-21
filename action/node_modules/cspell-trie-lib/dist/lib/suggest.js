"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggest = exports.genSuggestions = exports.genCompoundableSuggestions = void 0;
/**
 * This file is here to support code the referenced suggest directly and limit the exports.
 */
var suggest_1 = require("./suggestions/suggest");
Object.defineProperty(exports, "genCompoundableSuggestions", { enumerable: true, get: function () { return suggest_1.genCompoundableSuggestions; } });
Object.defineProperty(exports, "genSuggestions", { enumerable: true, get: function () { return suggest_1.genSuggestions; } });
Object.defineProperty(exports, "suggest", { enumerable: true, get: function () { return suggest_1.suggest; } });
//# sourceMappingURL=suggest.js.map