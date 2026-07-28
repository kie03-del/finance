"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserHousehold } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const accountId = String(formData.get("accountId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim();
  const merchant = String(formData.get("merchant") ?? "").trim() || null;
  const dateValue = String(formData.get("date") ?? "");
  const direction = String(formData.get("direction") ?? "expense");
  const rawAmount = Math.abs(Number(formData.get("amount") ?? 0));

  if (!accountId || !description || !dateValue || !Number.isFinite(rawAmount) || rawAmount === 0) {
    return;
  }

  const amount = direction === "income" ? rawAmount : -rawAmount;
  const date = new Date(dateValue);

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return;

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId,
        categoryId,
        description,
        merchant,
        date,
        amount,
        isBusiness: account.isBusiness,
      },
    }),
    prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: amount } },
    }),
  ]);

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/business");
  revalidatePath("/");
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return;

  await prisma.$transaction([
    prisma.account.update({
      where: { id: tx.accountId },
      data: { balance: { decrement: tx.amount } },
    }),
    prisma.transaction.delete({ where: { id } }),
  ]);

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/business");
  revalidatePath("/");
}
