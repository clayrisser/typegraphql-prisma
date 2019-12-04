"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const imports_1 = require("./imports");
const config_1 = require("./config");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateObjectTypeClassFromModel(project, baseDirPath, model, modelNames) {
    const dirPath = path_1.default.resolve(baseDirPath, config_1.modelsFolderName);
    const filePath = path_1.default.resolve(dirPath, `${model.name}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImports(sourceFile);
    imports_1.generateModelsImports(sourceFile, model.fields
        .filter(field => field.kind === "object")
        .map(field => field.type));
    imports_1.generateEnumsImports(sourceFile, model.fields
        .filter(field => field.kind === "enum")
        .map(field => field.type));
    const modelDocs = model.documentation && model.documentation.replace("\r", "");
    sourceFile.addClass({
        name: helpers_1.getBaseModelTypeName(model.name),
        isExported: true,
        decorators: [
            {
                name: "ObjectType",
                arguments: [
                    // `"${model.name}"`,
                    // `"${getBaseModelTypeName(model.name)}"`,
                    `{
            isAbstract: true,
            description: ${modelDocs ? `"${modelDocs}"` : "undefined"},
          }`,
                ],
            },
        ],
        properties: model.fields.map(field => {
            const isOptional = !!field.relationName || !field.isRequired;
            const fieldDocs = field.documentation && field.documentation.replace("\r", "");
            return {
                name: field.name,
                type: helpers_1.getFieldTSType(field, modelNames),
                hasExclamationToken: !isOptional,
                hasQuestionToken: isOptional,
                trailingTrivia: "\r\n",
                decorators: [
                    ...(field.relationName
                        ? []
                        : [
                            {
                                name: "Field",
                                arguments: [
                                    `_type => ${helpers_1.getTypeGraphQLType(field, modelNames)}`,
                                    `{
                        nullable: ${isOptional},
                        description: ${fieldDocs ? `"${fieldDocs}"` : "undefined"},
                      }`,
                                ],
                            },
                        ]),
                ],
                ...(fieldDocs && {
                    docs: [{ description: fieldDocs }],
                }),
            };
        }),
        ...(modelDocs && {
            docs: [{ description: modelDocs }],
        }),
    });
    await saveSourceFile_1.default(sourceFile);
}
exports.default = generateObjectTypeClassFromModel;
//# sourceMappingURL=object-type-class.js.map