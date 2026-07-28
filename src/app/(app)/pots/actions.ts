"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserHousehold } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPot(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const targetRaw = formData.get("targetAmount");
  const targetAmount = targetRaw ? Number(targetRaw) : null;

  if (!name) return;

  await prisma.pot.create({
    data: {
      name,
      householdId: household.id,
      targetAmount: targetAmount && Number.isFinite(targetAmount) ? targetAmount : null,
    },
  });

  revalidatePath("/pots");
  revalidatePath("/");
}

export async function contributeToPot(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const potId = String(formData.get("potId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);

  if (!potId || !memberId || !Number.isFinite(amount) || amount === 0) return;

  await prisma.$transaction([
    prisma.potContribution.create({
      data: { potId, memberId, amount },
    }),
    prisma.pot.update({
      where: { id: potId },
      data: { currentAmount: { increment: amount } },
    }),
  ]);

  revalidatePath("/pots");
  revalidatePath("/");
}

export async function deletePot(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pot.delete({ where: { id } });

  revalidatePath("/pots");
  revalidatePath("/");
}
