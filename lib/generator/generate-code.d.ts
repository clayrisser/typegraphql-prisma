import { DMMF } from "@prisma/photon/runtime";
export default function generateCode(dmmf: DMMF.Document, baseDirPath: string, log?: (msg: string) => void): Promise<void>;
