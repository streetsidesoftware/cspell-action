"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportError = void 0;
const errors_1 = require("../util/errors");
class ImportError extends Error {
    constructor(msg, cause) {
        super(msg);
        this.cause = (0, errors_1.isError)(cause) ? cause : undefined;
    }
}
exports.ImportError = ImportError;
//# sourceMappingURL=ImportError.js.map