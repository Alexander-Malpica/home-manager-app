import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/bills
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const items = await prisma.billsItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/bills failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/bills
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { name, amount, dueDate, category } = await req.json();

  if (!name || !amount || !dueDate || !category) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const newItem = await prisma.billsItem.create({
    data: {
      userId,
      name,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      category,
    },
  });

  return NextResponse.json(newItem);
}
