import { Project } from "ts-morph";
import { DMMF } from "@prisma/photon/runtime";
export default function generateArgsTypeClassFromArgs(project: Project, resolverDirPath: string, args: DMMF.SchemaArg[], methodName: string, modelNames: string[]): Promise<string>;
