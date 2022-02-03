"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionCollector = exports.isSuggestionResult = exports.impersonateCollector = exports.defaultSuggestionCollectorOptions = exports.compSuggestionResults = void 0;
/**
 * This file is here to support code the referenced suggest directly and limit the exports.
 */
var suggestCollector_1 = require("./suggestions/suggestCollector");
Object.defineProperty(exports, "compSuggestionResults", { enumerable: true, get: function () { return suggestCollector_1.compSuggestionResults; } });
Object.defineProperty(exports, "defaultSuggestionCollectorOptions", { enumerable: true, get: function () { return suggestCollector_1.defaultSuggestionCollectorOptions; } });
Object.defineProperty(exports, "impersonateCollector", { enumerable: true, get: function () { return suggestCollector_1.impersonateCollector; } });
Object.defineProperty(exports, "isSuggestionResult", { enumerable: true, get: function () { return suggestCollector_1.isSuggestionResult; } });
Object.defineProperty(exports, "suggestionCollector", { enumerable: true, get: function () { return suggestCollector_1.suggestionCollector; } });
//# sourceMappingURL=suggestCollector.js.map