"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatSettings = { indentSize: 2 };
async function saveSourceFile(sourceFile) {
    // TODO: find a fast way of removing not needed imports
    // sourceFile.organizeImports(formatSettings);
    sourceFile.formatText(formatSettings);
    await sourceFile.save();
}
exports.default = saveSourceFile;
//# sourceMappingURL=saveSourceFile.js.map