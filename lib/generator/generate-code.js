"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ts_morph_1 = require("ts-morph");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const enum_1 = tslib_1.__importDefault(require("./enum"));
const object_type_class_1 = tslib_1.__importDefault(require("./object-type-class"));
const relations_resolver_class_1 = tslib_1.__importDefault(require("./relations-resolver-class"));
const type_class_1 = require("./type-class");
const crud_resolver_class_1 = tslib_1.__importDefault(require("./crud-resolver-class"));
const config_1 = require("./config");
const imports_1 = require("./imports");
const saveSourceFile_1 = tslib_1.__importDefault(require("../utils/saveSourceFile"));
async function generateCode(dmmf, baseDirPath, log = helpers_1.noop) {
    const project = new ts_morph_1.Project();
    const resolversDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName);
    const modelNames = dmmf.datamodel.models.map(model => model.name);
    log("Generating enums...");
    const datamodelEnumNames = dmmf.datamodel.enums.map(enumDef => enumDef.name);
    await Promise.all(dmmf.datamodel.enums.map(enumDef => enum_1.default(project, baseDirPath, enumDef)));
    await Promise.all(dmmf.schema.enums
        // skip enums from datamodel
        .filter(enumDef => !datamodelEnumNames.includes(enumDef.name))
        .map(enumDef => enum_1.default(project, baseDirPath, enumDef)));
    const emittedEnumNames = [
        ...new Set([
            ...dmmf.schema.enums.map(it => it.name),
            ...dmmf.datamodel.enums.map(it => it.name),
        ]),
    ];
    const enumsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.enumsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateEnumsImports(enumsBarrelExportSourceFile, emittedEnumNames);
    await saveSourceFile_1.default(enumsBarrelExportSourceFile);
    log("Generating models...");
    await Promise.all(dmmf.datamodel.models.map(model => object_type_class_1.default(project, baseDirPath, model, modelNames)));
    const modelsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.modelsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateModelsBarrelFile(modelsBarrelExportSourceFile, dmmf.datamodel.models.map(it => it.name));
    await saveSourceFile_1.default(modelsBarrelExportSourceFile);
    log("Generating output types...");
    const rootTypes = dmmf.schema.outputTypes.filter(type => ["Query", "Mutation"].includes(type.name));
    const outputTypesToGenerate = dmmf.schema.outputTypes.filter(
    // skip generating models and root resolvers
    type => !modelNames.includes(type.name) && !rootTypes.includes(type));
    await Promise.all(outputTypesToGenerate.map(type => type_class_1.generateOutputTypeClassFromType(project, resolversDirPath, type, modelNames)));
    const outputsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.outputsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateOutputsBarrelFile(outputsBarrelExportSourceFile, outputTypesToGenerate.map(it => it.name));
    await saveSourceFile_1.default(outputsBarrelExportSourceFile);
    log("Generating input types...");
    await Promise.all(dmmf.schema.inputTypes.map(type => type_class_1.generateInputTypeClassFromType(project, resolversDirPath, type, modelNames)));
    const inputsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.inputsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateInputsBarrelFile(inputsBarrelExportSourceFile, dmmf.schema.inputTypes.map(it => it.name));
    await saveSourceFile_1.default(inputsBarrelExportSourceFile);
    log("Generating relation resolvers...");
    const relationResolversData = await Promise.all(dmmf.datamodel.models.map(model => {
        const outputType = dmmf.schema.outputTypes.find(type => type.name === model.name);
        return relations_resolver_class_1.default(project, baseDirPath, model, outputType, modelNames);
    }));
    const relationResolversBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateResolversBarrelFile("relations", relationResolversBarrelExportSourceFile, relationResolversData);
    await saveSourceFile_1.default(relationResolversBarrelExportSourceFile);
    log("Generating crud resolvers...");
    const crudResolversData = await Promise.all(dmmf.mappings.map(mapping => crud_resolver_class_1.default(project, baseDirPath, mapping, rootTypes, modelNames)));
    const crudResolversBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateResolversBarrelFile("crud", crudResolversBarrelExportSourceFile, crudResolversData);
    await saveSourceFile_1.default(crudResolversBarrelExportSourceFile);
    log("Generating index file");
    const indexSourceFile = project.createSourceFile(baseDirPath + "/index.ts", undefined, { overwrite: true });
    imports_1.generateIndexFile(indexSourceFile);
    await saveSourceFile_1.default(indexSourceFile);
}
exports.default = generateCode;
//# sourceMappingURL=generate-code.js.map