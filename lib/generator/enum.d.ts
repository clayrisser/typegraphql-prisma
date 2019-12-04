import { Project } from "ts-morph";
import { DMMF } from "@prisma/photon/runtime";
export default function generateEnumFromDef(project: Project, baseDirPath: string, enumDef: DMMF.Enum): Promise<void>;
