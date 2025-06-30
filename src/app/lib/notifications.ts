// lib/notifications.ts

import { prisma } from "@/app/lib/prisma";

// Define the notification payload type
interface NotificationPayload {
  householdId: string;
  type: string;
  title: string;
  body: string;
}

export async function createNotification({
  householdId,
  type,
  title,
  body,
}: NotificationPayload) {
  try {
    return await prisma.notification.create({
      data: { householdId, type, title, body },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw new Error("Could not create notification.");
  }
}
