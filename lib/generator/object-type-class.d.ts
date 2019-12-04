import { Project } from "ts-morph";
import { DMMF } from "@prisma/photon/runtime";
export default function generateObjectTypeClassFromModel(project: Project, baseDirPath: string, model: DMMF.Model, modelNames: string[]): Promise<void>;
