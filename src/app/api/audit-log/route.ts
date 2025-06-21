import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { action, itemType, itemName } = await req.json();

  const entry = await prisma.auditLog.create({
    data: {
      userId,
      userName: user.firstName || "Unknown",
      action,
      itemType,
      itemName,
    },
  });

  return NextResponse.json({
    ...entry,
    createdAt: entry.createdAt.toISOString(), // 🛠 ensure createdAt is serialized
  });
}

export async function GET(req: NextRequest) {
  // 🧹 Auto-delete logs older than 7 days
  await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    },
  });

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const user = searchParams.get("user") || "";
  const action = searchParams.get("action") || "";

  const where: Prisma.AuditLogWhereInput = {
    userName: {
      contains: user,
      mode: Prisma.QueryMode.insensitive,
    },
    action: {
      contains: action,
      mode: Prisma.QueryMode.insensitive,
    },
  };

  if (all) {
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formatted = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ logs: formatted });
  }

  const page = parseInt(searchParams.get("page") || "1", 10);
  const take = 5;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const formattedLogs = logs.map((log) => ({
    ...log,
    createdAt: log.createdAt?.toISOString() ?? null,
  }));

  return NextResponse.json({ logs: formattedLogs, total });
}
