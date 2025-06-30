import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuth, currentUser } from "@clerk/nextjs/server";

// Constants
const DAYS_TO_KEEP = 7;
const PAGE_SIZE = 5;

/**
 * 🔐 Utility to get user identity from Clerk
 */
async function getUserIdentity(req: NextRequest) {
  const { userId } = getAuth(req);
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !user || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, userName: user.firstName || "Unknown" };
}

/**
 * 📥 POST /api/audit-log - Create a new audit log entry
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, userName } = await getUserIdentity(req);
    const { action, itemType, itemName } = await req.json();

    const entry = await prisma.auditLog.create({
      data: { userId, userName, action, itemType, itemName },
    });

    return NextResponse.json({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Something went wrong:", err.message);
      return new NextResponse(err.message, { status: 500 });
    }

    console.error("Unexpected error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * 📤 GET /api/audit-log - Retrieve audit logs (paginated or full)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAll = searchParams.get("all") === "true";
    const userFilter = searchParams.get("user") || "";
    const actionFilter = searchParams.get("action") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * PAGE_SIZE;

    // 🧹 Remove old logs
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - DAYS_TO_KEEP * 24 * 60 * 60 * 1000),
        },
      },
    });

    const where: Prisma.AuditLogWhereInput = {
      userName: {
        contains: userFilter,
        mode: Prisma.QueryMode.insensitive,
      },
      action: {
        contains: actionFilter,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    if (isAll) {
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        logs: logs.map((log) => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
        })),
      });
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
    });
  } catch (err) {
    console.error("GET /api/audit-log failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
