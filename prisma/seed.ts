import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const DEFAULT_CATEGORIES: { name: string; icon: string; color: string }[] = [
  { name: "Groceries", icon: "shopping-cart", color: "#22c55e" },
  { name: "Dining & Takeaway", icon: "utensils", color: "#f97316" },
  { name: "Transport", icon: "car", color: "#3b82f6" },
  { name: "Housing & Bills", icon: "home", color: "#6366f1" },
  { name: "Subscriptions", icon: "repeat", color: "#a855f7" },
  { name: "Shopping", icon: "shopping-bag", color: "#ec4899" },
  { name: "Health & Fitness", icon: "heart-pulse", color: "#ef4444" },
  { name: "Entertainment", icon: "film", color: "#eab308" },
  { name: "Travel", icon: "plane", color: "#06b6d4" },
  { name: "Business", icon: "briefcase", color: "#0f766e" },
  { name: "Income", icon: "banknote", color: "#16a34a" },
  { name: "Transfers", icon: "arrow-left-right", color: "#64748b" },
  { name: "Uncategorized", icon: "circle", color: "#94a3b8" },
];

async function main() {
  const user1Email = process.env.SEED_USER1_EMAIL ?? "you@example.com";
  const user1Password = process.env.SEED_USER1_PASSWORD ?? "changeme123";
  const user1Name = process.env.SEED_USER1_NAME ?? "You";

  const user2Email = process.env.SEED_USER2_EMAIL;
  const user2Password = process.env.SEED_USER2_PASSWORD;
  const user2Name = process.env.SEED_USER2_NAME ?? "Partner";

  // Create primary user
  const passwordHash1 = await bcrypt.hash(user1Password, 12);
  const user1 = await prisma.user.create({
    data: {
      name: user1Name,
      email: user1Email,
      passwordHash: passwordHash1,
    },
  });
  console.log(`Created user: ${user1.email}`);

  // Create household
  const household = await prisma.household.create({
    data: {
      name: "My Household",
      ownerId: user1.id,
    },
  });
  console.log(`Created household: ${household.name}`);

  // Create household member for user1
  const member1 = await prisma.householdMember.create({
    data: {
      name: user1Name,
      relationship: "YOURSELF",
      color: "#3b82f6",
      householdId: household.id,
    },
  });
  console.log(`Added household member: ${member1.name}`);

  // Create partner user and member if provided
  if (user2Email && user2Password) {
    const passwordHash2 = await bcrypt.hash(user2Password, 12);
    const user2 = await prisma.user.create({
      data: {
        name: user2Name,
        email: user2Email,
        passwordHash: passwordHash2,
      },
    });
    console.log(`Created user: ${user2.email}`);

    const member2 = await prisma.householdMember.create({
      data: {
        name: user2Name,
        relationship: "PARTNER",
        color: "#ec4899",
        householdId: household.id,
      },
    });
    console.log(`Added household member: ${member2.name}`);
  } else {
    console.log("Skipped second user — set SEED_USER2_EMAIL / SEED_USER2_PASSWORD in .env to add your partner.");
  }

  // Create categories
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
