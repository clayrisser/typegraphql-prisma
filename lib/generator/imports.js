"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const config_1 = require("./config");
function generateTypeGraphQLImports(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "type-graphql",
        namedImports: [
            "registerEnumType",
            "ObjectType",
            "Field",
            "Int",
            "Float",
            "ID",
            "Resolver",
            "FieldResolver",
            "Root",
            "Ctx",
            "InputType",
            "Query",
            "Mutation",
            "Arg",
            "ArgsType",
            "Args",
        ].sort(),
    });
}
exports.generateTypeGraphQLImports = generateTypeGraphQLImports;
function generateDataloaderImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "dataloader",
        defaultImport: "DataLoader",
    });
}
exports.generateDataloaderImport = generateDataloaderImport;
function generateArgsBarrelFile(sourceFile, argsTypeNames) {
    sourceFile.addExportDeclarations(argsTypeNames
        .sort()
        .map(argTypeName => ({
        moduleSpecifier: `./${argTypeName}`,
        namedExports: [argTypeName],
    })));
}
exports.generateArgsBarrelFile = generateArgsBarrelFile;
function generateModelsBarrelFile(sourceFile, modelNames) {
    sourceFile.addExportDeclarations(modelNames
        .sort()
        .map(modelName => ({
        moduleSpecifier: `./${modelName}`,
        namedExports: [modelName],
    })));
}
exports.generateModelsBarrelFile = generateModelsBarrelFile;
function generateEnumsBarrelFile(sourceFile, enumTypeNames) {
    sourceFile.addExportDeclarations(enumTypeNames
        .sort()
        .map(enumTypeName => ({
        moduleSpecifier: `./${enumTypeName}`,
        namedExports: [enumTypeName],
    })));
}
exports.generateEnumsBarrelFile = generateEnumsBarrelFile;
function generateInputsBarrelFile(sourceFile, inputTypeNames) {
    sourceFile.addExportDeclarations(inputTypeNames
        .sort()
        .map(inputTypeName => ({
        moduleSpecifier: `./${inputTypeName}`,
        namedExports: [inputTypeName],
    })));
}
exports.generateInputsBarrelFile = generateInputsBarrelFile;
function generateOutputsBarrelFile(sourceFile, outputTypeNames) {
    sourceFile.addExportDeclarations(outputTypeNames
        .sort()
        .map(outputTypeName => ({
        moduleSpecifier: `./${outputTypeName}`,
        namedExports: [outputTypeName],
    })));
}
exports.generateOutputsBarrelFile = generateOutputsBarrelFile;
function generateIndexFile(sourceFile) {
    sourceFile.addExportDeclarations([
        { moduleSpecifier: `./${config_1.enumsFolderName}` },
        { moduleSpecifier: `./${config_1.modelsFolderName}` },
        { moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.crudResolversFolderName}` },
        {
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.relationsResolversFolderName}`,
        },
        { moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.inputsFolderName}` },
        { moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.outputsFolderName}` },
    ]);
}
exports.generateIndexFile = generateIndexFile;
function generateResolversBarrelFile(type, sourceFile, relationResolversData) {
    relationResolversData
        .sort((a, b) => a.modelName > b.modelName ? 1 : a.modelName < b.modelName ? -1 : 0)
        .forEach(({ modelName, resolverName, argTypeNames }) => {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${modelName}/${resolverName}`,
            namedExports: [resolverName],
        });
        if (argTypeNames.length) {
            sourceFile.addExportDeclaration({
                moduleSpecifier: `./${modelName}/args`,
            });
        }
    });
}
exports.generateResolversBarrelFile = generateResolversBarrelFile;
exports.generateModelsImports = createImportGenerator(config_1.modelsFolderName);
exports.generateEnumsImports = createImportGenerator(config_1.enumsFolderName);
exports.generateInputsImports = createImportGenerator(config_1.inputsFolderName);
exports.generateOutputsImports = createImportGenerator(config_1.outputsFolderName);
exports.generateArgsImports = createImportGenerator(config_1.argsFolderName);
function createImportGenerator(elementsDirName) {
    return (sourceFile, elementsNames, level = 1) => {
        const distinctElementsNames = [...new Set(elementsNames)].sort();
        for (const elementName of distinctElementsNames) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: (level === 0 ? "./" : "") +
                    path_1.default.posix.join(...Array(level).fill(".."), elementsDirName, elementName),
                // TODO: refactor to default exports
                // defaultImport: elementName,
                namedImports: [elementName],
            });
        }
    };
}
//# sourceMappingURL=imports.js.map