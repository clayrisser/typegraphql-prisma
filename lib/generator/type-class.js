"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const config_1 = require("./config");
const imports_1 = require("./imports");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateOutputTypeClassFromType(project, dirPath, type, modelNames) {
    const filePath = path_1.default.resolve(dirPath, config_1.outputsFolderName, `${type.name}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImports(sourceFile);
    // TODO: add more imports when needed
    sourceFile.addClass({
        name: type.name,
        isExported: true,
        decorators: [
            {
                name: "ObjectType",
                arguments: [
                    `{
            isAbstract: true,
            description: undefined,
          }`,
                ],
            },
        ],
        properties: type.fields.map(field => {
            const isRequired = field.outputType.isRequired;
            return {
                name: field.name,
                type: helpers_1.getFieldTSType(field.outputType, modelNames),
                hasExclamationToken: isRequired,
                hasQuestionToken: !isRequired,
                trailingTrivia: "\r\n",
                decorators: [
                    {
                        name: "Field",
                        arguments: [
                            `_type => ${helpers_1.getTypeGraphQLType(field.outputType, modelNames)}`,
                            `{
                  nullable: ${!isRequired},
                  description: undefined
                }`,
                        ],
                    },
                ],
            };
        }),
    });
    await saveSourceFile_1.default(sourceFile);
}
exports.generateOutputTypeClassFromType = generateOutputTypeClassFromType;
async function generateInputTypeClassFromType(project, dirPath, type, modelNames) {
    const filePath = path_1.default.resolve(dirPath, config_1.inputsFolderName, `${type.name}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImports(sourceFile);
    imports_1.generateInputsImports(sourceFile, type.fields
        .map(field => helpers_1.selectInputTypeFromTypes(field.inputType))
        .filter(fieldType => fieldType.kind === "object")
        .map(fieldType => fieldType.type)
        .filter(fieldType => fieldType !== type.name));
    imports_1.generateEnumsImports(sourceFile, type.fields
        .map(field => helpers_1.selectInputTypeFromTypes(field.inputType))
        .filter(fieldType => fieldType.kind === "enum")
        .map(fieldType => fieldType.type), 2);
    sourceFile.addClass({
        name: type.name,
        isExported: true,
        decorators: [
            {
                name: "InputType",
                arguments: [
                    `{
            isAbstract: true,
            description: undefined,
          }`,
                ],
            },
        ],
        properties: type.fields.map(field => {
            const inputType = helpers_1.selectInputTypeFromTypes(field.inputType);
            return {
                name: field.name,
                type: helpers_1.getFieldTSType(inputType, modelNames),
                hasExclamationToken: inputType.isRequired,
                hasQuestionToken: !inputType.isRequired,
                trailingTrivia: "\r\n",
                decorators: [
                    {
                        name: "Field",
                        arguments: [
                            `_type => ${helpers_1.getTypeGraphQLType(inputType, modelNames)}`,
                            `{
                  nullable: ${!inputType.isRequired},
                  description: undefined
                }`,
                        ],
                    },
                ],
            };
        }),
    });
    await saveSourceFile_1.default(sourceFile);
}
exports.generateInputTypeClassFromType = generateInputTypeClassFromType;
//# sourceMappingURL=type-class.js.map