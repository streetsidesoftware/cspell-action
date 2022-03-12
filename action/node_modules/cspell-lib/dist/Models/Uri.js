"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUri = exports.resolvePath = exports.joinPath = exports.extname = exports.dirname = exports.basename = exports.Uri = void 0;
const vscode_uri_1 = require("vscode-uri");
var vscode_uri_2 = require("vscode-uri");
Object.defineProperty(exports, "Uri", { enumerable: true, get: function () { return vscode_uri_2.URI; } });
exports.basename = vscode_uri_1.Utils.basename, exports.dirname = vscode_uri_1.Utils.dirname, exports.extname = vscode_uri_1.Utils.extname, exports.joinPath = vscode_uri_1.Utils.joinPath, exports.resolvePath = vscode_uri_1.Utils.resolvePath;
const isFile = /^(?:[a-zA-Z]:|[/\\])/;
const isPossibleUri = /\w:\/\//;
function toUri(uriOrFile) {
    if (uriOrFile instanceof vscode_uri_1.URI)
        return uriOrFile;
    return isFile.test(uriOrFile) && !isPossibleUri.test(uriOrFile) ? vscode_uri_1.URI.file(uriOrFile) : vscode_uri_1.URI.parse(uriOrFile);
}
exports.toUri = toUri;
//# sourceMappingURL=Uri.js.map