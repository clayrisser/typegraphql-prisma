import { Project } from "ts-morph";
import { DMMF } from "@prisma/photon/runtime";
export declare function generateOutputTypeClassFromType(project: Project, dirPath: string, type: DMMF.OutputType, modelNames: string[]): Promise<void>;
export declare function generateInputTypeClassFromType(project: Project, dirPath: string, type: DMMF.InputType, modelNames: string[]): Promise<void>;
