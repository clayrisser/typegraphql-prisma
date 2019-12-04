"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const config_1 = require("./config");
const imports_1 = require("./imports");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateArgsTypeClassFromArgs(project, resolverDirPath, args, methodName, modelNames) {
    const name = `${helpers_1.pascalCase(methodName)}Args`;
    const dirPath = path_1.default.resolve(resolverDirPath, config_1.argsFolderName);
    const filePath = path_1.default.resolve(dirPath, `${name}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImports(sourceFile);
    imports_1.generateInputsImports(sourceFile, args
        .map(arg => helpers_1.selectInputTypeFromTypes(arg.inputType))
        .filter(argType => argType.kind === "object")
        .map(argType => argType.type), 3);
    imports_1.generateEnumsImports(sourceFile, args
        .map(field => helpers_1.selectInputTypeFromTypes(field.inputType))
        .filter(argType => argType.kind === "enum")
        .map(argType => argType.type), 3);
    sourceFile.addClass({
        name,
        isExported: true,
        decorators: [
            {
                name: "ArgsType",
                arguments: [],
            },
        ],
        properties: args.map(arg => {
            const inputType = helpers_1.selectInputTypeFromTypes(arg.inputType);
            const isOptional = !inputType.isRequired;
            return {
                name: arg.name,
                type: helpers_1.getFieldTSType(inputType, modelNames),
                hasExclamationToken: !isOptional,
                hasQuestionToken: isOptional,
                trailingTrivia: "\r\n",
                decorators: [
                    {
                        name: "Field",
                        arguments: [
                            `_type => ${helpers_1.getTypeGraphQLType(inputType, modelNames)}`,
                            `{ nullable: ${isOptional} }`,
                        ],
                    },
                ],
            };
        }),
    });
    await saveSourceFile_1.default(sourceFile);
    return name;
}
exports.default = generateArgsTypeClassFromArgs;
//# sourceMappingURL=args-class.js.map