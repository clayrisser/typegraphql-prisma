import { Project } from "ts-morph";
import { DMMF } from "@prisma/photon/runtime";
import { GeneratedResolverData } from "./types";
export default function generateCrudResolverClassFromMapping(project: Project, baseDirPath: string, mapping: DMMF.Mapping, types: DMMF.OutputType[], modelNames: string[]): Promise<GeneratedResolverData>;
