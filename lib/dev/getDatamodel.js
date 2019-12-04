"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const util_1 = require("util");
const readFile = util_1.promisify(fs_1.default.readFile);
const exists = util_1.promisify(fs_1.default.exists);
async function getDatamodel(cwd) {
    let datamodelPath = path_1.default.join(cwd, "project.prisma");
    if (!(await exists(datamodelPath))) {
        datamodelPath = path_1.default.join(cwd, "schema.prisma");
    }
    if (!(await exists(datamodelPath))) {
        throw new Error(`Could not find ${datamodelPath}`);
    }
    return readFile(datamodelPath, "utf-8");
}
exports.getDatamodel = getDatamodel;
//# sourceMappingURL=getDatamodel.js.map