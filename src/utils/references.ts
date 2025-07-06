import { PrismaClient } from "@prisma/client";
import { CBHPMRecord } from "../types/cbhpm";

const prisma = new PrismaClient();

export async function getReferenceData(
  code: string,
): Promise<CBHPMRecord | null> {
  const procedure = await prisma.cBHPMProcedure.findUnique({
    where: { code },
  });

  if (!procedure) {
    return null;
  }

  return {
    code: procedure.code,
    description: procedure.description,
    surgeonValue: procedure.surgeonValue,
    anesthetistValue: procedure.anesthetistValue,
    firstAssistantValue: procedure.firstAssistantValue,
  };
}
