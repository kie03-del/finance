"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserHousehold } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "CHECKING");
  const ownerType = String(formData.get("ownerType") ?? "PERSONAL");
  const ownerId = String(formData.get("ownerId") ?? "") || null;
  const balance = Number(formData.get("balance") ?? 0);

  if (!name) return;

  await prisma.account.create({
    data: {
      name,
      institution,
      kind: kind as any,
      ownerType: ownerType as any,
      isBusiness: ownerType === "BUSINESS",
      householdId: household.id,
      ownerId: ownerType === "PERSONAL" ? ownerId : null,
      balance: Number.isFinite(balance) ? balance : 0,
    },
  });

  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.account.delete({ where: { id } });

  revalidatePath("/accounts");
  revalidatePath("/");
}
