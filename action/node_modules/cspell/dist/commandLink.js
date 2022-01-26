"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandLink = void 0;
const link_1 = require("./link");
const errors_1 = require("./util/errors");
const table_1 = require("./util/table");
function commandLink(prog) {
    const linkCommand = prog
        .command('link')
        .description('Link dictionaries and other settings to the cspell global config.');
    linkCommand
        .command('list', { isDefault: true })
        .alias('ls')
        .description('List currently linked configurations.')
        .action(() => {
        const imports = (0, link_1.listGlobalImports)();
        const table = (0, link_1.listGlobalImportsResultToTable)(imports.list);
        (0, table_1.tableToLines)(table).forEach((line) => console.log(line));
        return;
    });
    linkCommand
        .command('add <dictionaries...>')
        .alias('a')
        .description('Add dictionaries any other settings to the cspell global config.')
        .action((dictionaries) => {
        const r = (0, link_1.addPathsToGlobalImports)(dictionaries);
        const table = (0, link_1.addPathsToGlobalImportsResultToTable)(r);
        console.log('Adding:');
        (0, table_1.tableToLines)(table).forEach((line) => console.log(line));
        if (r.error) {
            throw new errors_1.CheckFailed(r.error, 1);
        }
        return;
    });
    linkCommand
        .command('remove <paths...>')
        .alias('r')
        .description('Remove matching paths / packages from the global config.')
        .action((dictionaries) => {
        const r = (0, link_1.removePathsFromGlobalImports)(dictionaries);
        console.log('Removing:');
        if (r.error) {
            throw new errors_1.CheckFailed(r.error, 1);
        }
        r.removed.map((f) => console.log(f));
        return;
    });
    return linkCommand;
}
exports.commandLink = commandLink;
//# sourceMappingURL=commandLink.js.map