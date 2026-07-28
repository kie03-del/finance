import { prisma } from "@/lib/prisma";
import { startOfMonth } from "date-fns";

export async function getUserHousehold(userId: string) {
  return prisma.household.findUnique({
    where: { ownerId: userId },
    include: {
      members: true,
      accounts: {
        include: { owner: true },
      },
      pots: {
        include: {
          contributions: { orderBy: { date: "desc" }, take: 3 },
        },
      },
    },
  });
}

export async function getNetWorthSummary(householdId: string) {
  const [accounts, household] = await Promise.all([
    prisma.account.findMany({
      where: { householdId },
      include: { owner: true },
    }),
    prisma.household.findUnique({
      where: { id: householdId },
      include: { members: true },
    }),
  ]);

  const byMemberId: Record<string, number> = {};
  let joint = 0;
  let business = 0;

  for (const account of accounts) {
    if (account.ownerType === "BUSINESS") {
      business += account.balance;
    } else if (account.ownerType === "JOINT") {
      joint += account.balance;
    } else if (account.owner) {
      byMemberId[account.owner.id] = (byMemberId[account.owner.id] ?? 0) + account.balance;
    }
  }

  const pots = await prisma.pot.aggregate({
    where: { householdId },
    _sum: { currentAmount: true },
  });
  const potsTotal = pots._sum.currentAmount ?? 0;

  // Create member balances with names
  const byMember: Record<string, number> = {};
  if (household) {
    for (const member of household.members) {
      byMember[member.name] = byMemberId[member.id] ?? 0;
    }
  }

  const personalTotal = Object.values(byMember).reduce((a, b) => a + b, 0);
  const netWorth = personalTotal + joint + business + potsTotal;

  return { byMember, joint, business, potsTotal, netWorth };
}

export async function getCategorySpendThisMonth(householdId: string) {
  const since = startOfMonth(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { householdId },
      date: { gte: since },
      amount: { lt: 0 },
      isBusiness: false,
    },
    include: { category: true },
  });

  const totals = new Map<string, { name: string; color: string; total: number }>();
  for (const tx of transactions) {
    const key = tx.category?.id ?? "uncategorized";
    const name = tx.category?.name ?? "Uncategorized";
    const color = tx.category?.color ?? "#94a3b8";
    const existing = totals.get(key) ?? { name, color, total: 0 };
    existing.total += Math.abs(tx.amount);
    totals.set(key, existing);
  }

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

export async function getBusinessSummary(householdId: string) {
  const transactions = await prisma.transaction.findMany({
    where: {
      account: { householdId },
      isBusiness: true,
    },
    include: { category: true, account: true },
    orderBy: { date: "desc" },
  });

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return { income, expenses, profit: income - expenses, transactions };
}

export async function getRecentTransactions(householdId: string, limit = 10) {
  return prisma.transaction.findMany({
    where: { account: { householdId } },
    orderBy: { date: "desc" },
    take: limit,
    include: { account: true, category: true, author: { include: { member: true } } },
  });
}
