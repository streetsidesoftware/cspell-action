"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncFlatten = exports.asyncAwait = exports.asyncFilter = exports.asyncMap = exports.mergeAsyncIterables = exports.asyncIterableToArray = exports.asyncPipe = exports.asyncOperators = exports.asyncHelpers = void 0;
const cspell_pipe_1 = require("@cspell/cspell-pipe");
var cspell_pipe_2 = require("@cspell/cspell-pipe");
Object.defineProperty(exports, "asyncHelpers", { enumerable: true, get: function () { return cspell_pipe_2.helpers; } });
Object.defineProperty(exports, "asyncOperators", { enumerable: true, get: function () { return cspell_pipe_2.operators; } });
Object.defineProperty(exports, "asyncPipe", { enumerable: true, get: function () { return cspell_pipe_2.pipeAsync; } });
Object.defineProperty(exports, "asyncIterableToArray", { enumerable: true, get: function () { return cspell_pipe_2.toArray; } });
Object.defineProperty(exports, "mergeAsyncIterables", { enumerable: true, get: function () { return cspell_pipe_2.toAsyncIterable; } });
exports.asyncMap = cspell_pipe_1.operators.opMapAsync, exports.asyncFilter = cspell_pipe_1.operators.opFilterAsync, exports.asyncAwait = cspell_pipe_1.operators.opAwaitAsync, exports.asyncFlatten = cspell_pipe_1.operators.opFlattenAsync;
//# sourceMappingURL=async.js.map