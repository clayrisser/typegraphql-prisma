"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const generate_code_1 = tslib_1.__importDefault(require("../generator/generate-code"));
const removeDir_1 = tslib_1.__importDefault(require("../utils/removeDir"));
async function generate(options) {
    const outputDir = options.generator.output;
    await fs_1.promises.mkdir(outputDir, { recursive: true });
    await removeDir_1.default(outputDir, true);
    const photonDmmf = require(options.otherGenerators.find(it => it.provider === "photonjs").output).dmmf;
    if (options.generator.config.emitDMMF) {
        await Promise.all([
            fs_1.promises.writeFile(path_1.default.resolve(outputDir, "./dmmf.json"), JSON.stringify(options.dmmf, null, 2)),
            fs_1.promises.writeFile(path_1.default.resolve(outputDir, "./photon-dmmf.json"), JSON.stringify(photonDmmf, null, 2)),
        ]);
    }
    // TODO: replace with `options.dmmf` when the spec match photon output
    await generate_code_1.default(photonDmmf, outputDir);
    return "";
}
exports.generate = generate;
//# sourceMappingURL=prisma-generator.js.map