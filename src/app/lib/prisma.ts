// src/app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Ensure a global singleton in development to avoid reinitializing Prisma
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
