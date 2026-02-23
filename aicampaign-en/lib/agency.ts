import { prisma } from "@/lib/prisma";

export async function ensureAdminWorkspace(userId: string) {
  // 1) find or create workspace owned by this user
  const workspace =
    (await prisma.agencyWorkspace.findUnique({ where: { ownerId: userId } })) ??
    (await prisma.agencyWorkspace.create({
      data: { ownerId: userId, name: "My Agency" },
    }));

  // 2) ensure owner is ADMIN member
  await prisma.agencyMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId },
    },
    update: { role: "ADMIN" },
    create: { workspaceId: workspace.id, userId, role: "ADMIN" },
  });

  return workspace;
}