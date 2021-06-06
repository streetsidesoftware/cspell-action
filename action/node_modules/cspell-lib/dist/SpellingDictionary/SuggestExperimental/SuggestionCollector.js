"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionCollector = void 0;
const helpers_1 = require("./helpers");
class SuggestionCollector {
    constructor(size, minScore) {
        this.size = size;
        this.minScore = minScore;
        this.results = [];
    }
    get collection() {
        return this.results.concat();
    }
    get sortedCollection() {
        return this.collection.sort(helpers_1.compareResults);
    }
}
exports.SuggestionCollector = SuggestionCollector;
//# sourceMappingURL=SuggestionCollector.js.map