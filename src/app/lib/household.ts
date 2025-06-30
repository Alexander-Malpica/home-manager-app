import { prisma } from "@/app/lib/prisma";

export const getOrCreateHousehold = async (userId: string, email: string) => {
  // Check if user already belongs to a household
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId },
    include: { Household: true },
  });

  if (existingMembership) {
    return existingMembership.Household;
  }

  // Check if user was invited
  const pendingInvite = await prisma.householdMember.findFirst({
    where: { invitedEmail: email, status: "pending" },
    include: { Household: true },
  });

  if (pendingInvite) {
    await prisma.householdMember.update({
      where: { id: pendingInvite.id },
      data: { userId, status: "accepted" },
    });
    return pendingInvite.Household;
  }

  // Create a new household and assign owner role
  const household = await prisma.household.create({
    data: {
      name: `${email.split("@")[0]}'s Home`,
      members: {
        create: {
          userId,
          role: "owner",
          status: "accepted",
        },
      },
    },
  });

  return household;
};
