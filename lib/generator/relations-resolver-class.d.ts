import { Project } from "ts-morph";
import { DMMF } from "@prisma/photon/runtime";
import { GeneratedResolverData } from "./types";
export default function generateRelationsResolverClassesFromModel(project: Project, baseDirPath: string, model: DMMF.Model, outputType: DMMF.OutputType, modelNames: string[]): Promise<GeneratedResolverData>;
