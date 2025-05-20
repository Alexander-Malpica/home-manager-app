// lib/notifications.ts

import { prisma } from "@/app/lib/prisma";

export async function createNotification({
  householdId,
  type,
  title,
  body,
}: {
  householdId: string;
  type: string;
  title: string;
  body: string;
}) {
  return await prisma.notification.create({
    data: { householdId, type, title, body },
  });
}
