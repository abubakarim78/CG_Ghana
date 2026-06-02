import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CG-${year}-`;

  // Find the highest existing sequence for this year to avoid collisions after restarts
  const last = await prisma.case.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: 'desc' },
    select: { caseNumber: true },
  });

  let seq = 1;
  if (last?.caseNumber) {
    const parsed = parseInt(last.caseNumber.slice(prefix.length), 10);
    if (!isNaN(parsed)) seq = parsed + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
}
