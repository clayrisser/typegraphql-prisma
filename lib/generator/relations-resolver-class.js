"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pluralize_1 = tslib_1.__importDefault(require("pluralize"));
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const args_class_1 = tslib_1.__importDefault(require("./args-class"));
const config_1 = require("./config");
const imports_1 = require("./imports");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateRelationsResolverClassesFromModel(project, baseDirPath, model, outputType, modelNames) {
    const resolverName = `${model.name}RelationsResolver`;
    const relationFields = model.fields.filter(field => field.relationName);
    const idField = model.fields.find(field => field.isId);
    const rootArgName = helpers_1.camelCase(model.name);
    const resolverDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, model.name);
    const filePath = path_1.default.resolve(resolverDirPath, `${resolverName}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    const methodsInfo = await Promise.all(relationFields.map(async (field) => {
        const outputTypeField = outputType.fields.find(it => it.name === field.name);
        const fieldDocs = field.documentation && field.documentation.replace("\r", "");
        const fieldType = helpers_1.getFieldTSType(field, modelNames);
        let argsTypeName;
        if (outputTypeField.args.length > 0) {
            argsTypeName = await args_class_1.default(project, resolverDirPath, outputTypeField.args, model.name + helpers_1.pascalCase(field.name), modelNames);
        }
        return { field, fieldDocs, fieldType, argsTypeName };
    }));
    const argTypeNames = methodsInfo
        .filter(it => it.argsTypeName !== undefined)
        .map(it => it.argsTypeName);
    const barrelExportSourceFile = project.createSourceFile(path_1.default.resolve(resolverDirPath, config_1.argsFolderName, "index.ts"), undefined, { overwrite: true });
    if (argTypeNames.length) {
        imports_1.generateArgsBarrelFile(barrelExportSourceFile, argTypeNames);
        await saveSourceFile_1.default(barrelExportSourceFile);
    }
    imports_1.generateTypeGraphQLImports(sourceFile);
    imports_1.generateDataloaderImport(sourceFile);
    imports_1.generateModelsImports(sourceFile, [...relationFields.map(field => field.type), model.name], 3);
    imports_1.generateArgsImports(sourceFile, argTypeNames, 0);
    sourceFile.addClass({
        name: resolverName,
        isExported: true,
        decorators: [
            {
                name: "Resolver",
                arguments: [`_of => ${helpers_1.getBaseModelTypeName(model.name)}`],
            },
        ],
        methods: methodsInfo.map(({ field, fieldType, fieldDocs, argsTypeName }) => {
            const [createDataLoaderGetterFunctionName, dataLoaderGetterInCtxName,] = createDataLoaderGetterCreationStatement(sourceFile, model.name, field.name, idField.name, helpers_1.getFieldTSType(idField, modelNames), fieldType);
            return {
                name: field.name,
                isAsync: true,
                returnType: `Promise<${fieldType}>`,
                decorators: [
                    {
                        name: "FieldResolver",
                        arguments: [
                            `_type => ${helpers_1.getTypeGraphQLType(field, modelNames)}`,
                            `{
                  nullable: ${!field.isRequired},
                  description: ${fieldDocs ? `"${fieldDocs}"` : "undefined"},
                }`,
                        ],
                    },
                ],
                parameters: [
                    {
                        name: rootArgName,
                        type: `${helpers_1.getBaseModelTypeName(model.name)}`,
                        decorators: [{ name: "Root", arguments: [] }],
                    },
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
                // TODO: refactor to AST
                statements: [
                    `ctx.${dataLoaderGetterInCtxName} = ctx.${dataLoaderGetterInCtxName} || ${createDataLoaderGetterFunctionName}(ctx.photon);`,
                    `return ctx.${dataLoaderGetterInCtxName}(${argsTypeName ? "args" : "{}"}).load(${rootArgName}.${idField.name});`,
                ],
            };
        }),
    });
    await saveSourceFile_1.default(sourceFile);
    return { modelName: model.name, resolverName, argTypeNames };
}
exports.default = generateRelationsResolverClassesFromModel;
function createDataLoaderGetterCreationStatement(sourceFile, modelName, relationFieldName, idFieldName, rootKeyType, fieldType) {
    // TODO: use `mappings`
    const dataLoaderName = `${helpers_1.camelCase(modelName)}${helpers_1.pascalCase(relationFieldName)}DataLoader`;
    const dataLoaderGetterInCtxName = `get${helpers_1.pascalCase(dataLoaderName)}`;
    const functionName = `create${helpers_1.pascalCase(dataLoaderGetterInCtxName)}`;
    const collectionName = pluralize_1.default(helpers_1.camelCase(modelName));
    sourceFile.addFunction({
        name: functionName,
        parameters: [
            // TODO: import Photon type
            { name: "photon", type: "any" },
        ],
        statements: [
            // TODO: refactor to AST
            `const argsToDataLoaderMap = new Map<string, DataLoader<${rootKeyType}, ${fieldType}>>();
      return function ${dataLoaderGetterInCtxName}(args: any) {
        const argsJSON = JSON.stringify(args);
        let ${dataLoaderName} = argsToDataLoaderMap.get(argsJSON);
        if (!${dataLoaderName}) {
          ${dataLoaderName} = new DataLoader<${rootKeyType}, ${fieldType}>(async keys => {
            const fetchedData: any[] = await photon.${collectionName}.findMany({
              where: { ${idFieldName}: { in: keys } },
              select: {
                ${idFieldName}: true,
                ${relationFieldName}: args,
              },
            });
            return keys
              .map(key => fetchedData.find(data => data.${idFieldName} === key)!)
              .map(data => data.${relationFieldName});
          });
          argsToDataLoaderMap.set(argsJSON, ${dataLoaderName});
        }
        return ${dataLoaderName};
      }`,
        ],
    });
    return [functionName, dataLoaderGetterInCtxName];
}
//# sourceMappingURL=relations-resolver-class.js.map