"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const config_1 = require("./config");
const args_class_1 = tslib_1.__importDefault(require("./args-class"));
const imports_1 = require("./imports");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateCrudResolverClassFromMapping(project, baseDirPath, mapping, types, modelNames) {
    const modelName = helpers_1.getBaseModelTypeName(mapping.model);
    const resolverName = `${modelName}CrudResolver`;
    const resolverDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, modelName);
    const filePath = path_1.default.resolve(resolverDirPath, `${resolverName}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImports(sourceFile);
    const actionNames = Object.keys(mapping).filter(key => !config_1.baseKeys.includes(key));
    const supportedActionNames = actionNames.filter(actionName => getOperationKindName(actionName) !== undefined);
    const methodsInfo = await Promise.all(supportedActionNames.map(async (actionName) => {
        const operationKind = getOperationKindName(actionName);
        const fieldName = mapping[actionName];
        const type = types.find(type => type.fields.some(field => field.name === fieldName));
        if (!type) {
            throw new Error(`Cannot find type with field ${fieldName} in root types definitions!`);
        }
        const method = type.fields.find(field => field.name === fieldName);
        if (!method) {
            throw new Error(`Cannot find field ${fieldName} in output types definitions!`);
        }
        const outputTypeName = method.outputType.type;
        let argsTypeName;
        if (method.args.length > 0) {
            argsTypeName = await args_class_1.default(project, resolverDirPath, method.args, method.name, modelNames);
        }
        return {
            operationKind,
            method,
            actionName,
            outputTypeName,
            argsTypeName,
        };
    }));
    const argTypeNames = methodsInfo
        .filter(it => it.argsTypeName !== undefined)
        .map(it => it.argsTypeName);
    if (argTypeNames.length) {
        const barrelExportSourceFile = project.createSourceFile(path_1.default.resolve(resolverDirPath, config_1.argsFolderName, "index.ts"), undefined, { overwrite: true });
        imports_1.generateArgsBarrelFile(barrelExportSourceFile, methodsInfo
            .filter(it => it.argsTypeName !== undefined)
            .map(it => it.argsTypeName));
        await saveSourceFile_1.default(barrelExportSourceFile);
    }
    imports_1.generateArgsImports(sourceFile, argTypeNames, 0);
    const distinctOutputTypesNames = [
        ...new Set(methodsInfo.map(it => it.outputTypeName)),
    ];
    imports_1.generateModelsImports(sourceFile, distinctOutputTypesNames.filter(typeName => modelNames.includes(typeName)), 3);
    imports_1.generateOutputsImports(sourceFile, distinctOutputTypesNames.filter(typeName => !modelNames.includes(typeName)), 2);
    sourceFile.addClass({
        name: resolverName,
        isExported: true,
        decorators: [
            {
                name: "Resolver",
                arguments: [`_of => ${modelName}`],
            },
        ],
        methods: await Promise.all(methodsInfo.map(({ operationKind, actionName, method, argsTypeName }) => {
            const returnTSType = helpers_1.getFieldTSType(method.outputType, modelNames);
            return {
                name: method.name,
                isAsync: true,
                returnType: `Promise<${returnTSType}>`,
                decorators: [
                    {
                        name: operationKind,
                        arguments: [
                            `_returns => ${helpers_1.getTypeGraphQLType(method.outputType, modelNames)}`,
                            `{
                  nullable: ${!method.outputType.isRequired},
                  description: undefined
                }`,
                        ],
                    },
                ],
                parameters: [
                    {
                        name: "ctx",
                        // TODO: import custom `ContextType`
                        type: "any",
                        decorators: [{ name: "Ctx", arguments: [] }],
                    },
                    ...(!argsTypeName
                        ? []
                        : [
                            {
                                name: "args",
                                type: argsTypeName,
                                decorators: [{ name: "Args", arguments: [] }],
                            },
                        ]),
                ],
                statements: [
                    `return ctx.photon.${mapping.plural}.${actionName}(${argsTypeName ? "args" : ""});`,
                ],
            };
        })),
    });
    await saveSourceFile_1.default(sourceFile);
    return { modelName, resolverName, argTypeNames };
}
exports.default = generateCrudResolverClassFromMapping;
function getOperationKindName(actionName) {
    if (config_1.supportedQueries.includes(actionName))
        return "Query";
    if (config_1.supportedMutations.includes(actionName))
        return "Mutation";
}
//# sourceMappingURL=crud-resolver-class.js.map