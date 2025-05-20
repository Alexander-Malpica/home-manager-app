// lib/household.ts
import { prisma } from "@/app/lib/prisma";

export const getOrCreateHousehold = async (userId: string, email: string) => {
  // ✅ First, check if user already belongs to a household
  const existing = await prisma.householdMember.findFirst({
    where: { userId },
    include: { Household: true },
  });

  if (existing) {
    return existing.Household;
  }

  // ✅ If the user was invited (but hasn't accepted), link them
  const invited = await prisma.householdMember.findFirst({
    where: { invitedEmail: email, status: "pending" },
    include: { Household: true },
  });

  if (invited) {
    await prisma.householdMember.update({
      where: { id: invited.id },
      data: {
        userId,
        status: "accepted",
      },
    });
    return invited.Household;
  }

  // ✅ Otherwise, create a new household and assign owner role
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
