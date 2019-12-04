"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const generate_code_1 = tslib_1.__importDefault(require("../generator/generate-code"));
async function generate(dmmfJSONPath, outputTSFilePath) {
    console.log("Loading datamodel...");
    const dmmf = require(dmmfJSONPath);
    await generate_code_1.default(dmmf, outputTSFilePath, console.log);
}
exports.default = generate;
//# sourceMappingURL=generate.js.map