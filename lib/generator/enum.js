"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const imports_1 = require("./imports");
const config_1 = require("./config");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateEnumFromDef(project, baseDirPath, enumDef) {
    const dirPath = path_1.default.resolve(baseDirPath, config_1.enumsFolderName);
    const filePath = path_1.default.resolve(dirPath, `${enumDef.name}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImports(sourceFile);
    const documentation = enumDef.documentation && enumDef.documentation.replace("\r", "");
    sourceFile.addEnum({
        isExported: true,
        name: enumDef.name,
        ...(documentation && {
            docs: [{ description: documentation }],
        }),
        members: enumDef.values.map(enumValue => ({
            name: enumValue,
            value: enumValue,
        })),
    });
    // TODO: refactor to AST
    sourceFile.addStatements([
        `registerEnumType(${enumDef.name}, {
      name: "${enumDef.name}",
      description: ${documentation ? `"${documentation}"` : "undefined"},
    });`,
    ]);
    await saveSourceFile_1.default(sourceFile);
}
exports.default = generateEnumFromDef;
//# sourceMappingURL=enum.js.map