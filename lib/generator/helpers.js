"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function noop() { }
exports.noop = noop;
function getBaseModelTypeName(modelName) {
    // TODO: add proper support for swapping model types with custom types
    // return `Base${modelName}`;
    return modelName;
}
exports.getBaseModelTypeName = getBaseModelTypeName;
function getFieldTSType(typeInfo, modelNames) {
    let TSType;
    if (typeInfo.kind === "scalar") {
        TSType = mapScalarToTSType(typeInfo.type);
    }
    else if (typeInfo.kind === "object") {
        if (modelNames.includes(typeInfo.type)) {
            TSType = getBaseModelTypeName(typeInfo.type);
        }
        else {
            TSType = typeInfo.type;
        }
    }
    else if (typeInfo.kind === "enum") {
        TSType = `keyof typeof ${typeInfo.type}`;
    }
    else {
        throw new Error(`Unsupported field type kind: ${typeInfo.kind}`);
    }
    if (typeInfo.isList) {
        TSType += "[]";
    }
    if (!typeInfo.isRequired) {
        TSType += " | null";
    }
    return TSType;
}
exports.getFieldTSType = getFieldTSType;
function mapScalarToTSType(scalar) {
    switch (scalar) {
        case "ID": {
            // TODO: detect proper type of id field
            return "string";
        }
        case "String": {
            return "string";
        }
        case "Boolean": {
            return "boolean";
        }
        case "DateTime": {
            return "Date";
        }
        case "Int":
        case "Float": {
            return "number";
        }
        default:
            throw new Error(`Unrecognized scalar type: ${scalar}`);
    }
}
exports.mapScalarToTSType = mapScalarToTSType;
function getTypeGraphQLType(typeInfo, modelNames) {
    let GraphQLType;
    if (typeInfo.kind === "scalar") {
        GraphQLType = mapScalarToTypeGraphQLType(typeInfo.type);
    }
    else if (typeInfo.kind === "object") {
        if (modelNames.includes(typeInfo.type)) {
            GraphQLType = getBaseModelTypeName(typeInfo.type);
        }
        else {
            GraphQLType = typeInfo.type;
        }
    }
    else {
        GraphQLType = typeInfo.type;
    }
    if (typeInfo.isList) {
        GraphQLType = `[${GraphQLType}]`;
    }
    return GraphQLType;
}
exports.getTypeGraphQLType = getTypeGraphQLType;
function mapScalarToTypeGraphQLType(scalar) {
    switch (scalar) {
        case "DateTime": {
            return "Date";
        }
        case "Boolean":
        case "String":
        case "ID":
        case "Int":
        case "Float": {
            return scalar;
        }
        default:
            throw new Error(`Unrecognized scalar type: ${scalar}`);
    }
}
exports.mapScalarToTypeGraphQLType = mapScalarToTypeGraphQLType;
function selectInputTypeFromTypes(inputTypes) {
    // FIXME: *Enum*Filter are currently empty
    return (inputTypes.find(it => it.kind === "enum") ||
        inputTypes.find(it => it.kind === "object") ||
        inputTypes[0]);
}
exports.selectInputTypeFromTypes = selectInputTypeFromTypes;
function camelCase(str) {
    return str[0].toLowerCase() + str.slice(1);
}
exports.camelCase = camelCase;
function pascalCase(str) {
    return str[0].toUpperCase() + str.slice(1);
}
exports.pascalCase = pascalCase;
//# sourceMappingURL=helpers.js.map