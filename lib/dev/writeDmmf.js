"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const runtime_1 = require("@prisma/photon/runtime");
const fs_1 = tslib_1.__importDefault(require("fs"));
const getDatamodel_1 = require("./getDatamodel");
async function writeDmmf(cwd, dmmfJSONPath) {
    try {
        const datamodel = await getDatamodel_1.getDatamodel(cwd);
        const dmmf = await runtime_1.getDMMF({ datamodel, cwd });
        console.log("Writing dmmf...");
        fs_1.default.writeFileSync(dmmfJSONPath, JSON.stringify(dmmf, null, 2));
    }
    catch (err) {
        console.error("something went wrong:", err);
    }
}
exports.writeDmmf = writeDmmf;
//# sourceMappingURL=writeDmmf.js.map