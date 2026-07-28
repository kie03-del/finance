import { auth } from "@/auth";
import { getUserHousehold } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { createTransaction, deleteTransaction } from "./actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { account: { householdId: household.id } },
      orderBy: { date: "desc" },
      include: { account: true, category: true },
      take: 100,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">Transactions</h1>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800 mb-10">
        {transactions.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 px-6 py-8">
            No transactions yet — add your first one below.
          </p>
        )}
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-slate-50">{tx.description}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatDate(tx.date)} · {tx.account.name}
                {tx.category ? ` · ${tx.category.name}` : ""}
                {tx.isBusiness ? " · Business" : ""}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span
                className={`font-mono text-sm font-semibold ${
                  tx.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-slate-50"
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatCurrency(tx.amount, tx.account.currency)}
              </span>
              <form action={deleteTransaction}>
                <input type="hidden" name="id" value={tx.id} />
                <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 max-w-lg">
        <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">Add transaction</h2>
        <form action={createTransaction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Account</label>
            <select
              name="accountId"
              required
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {household.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Description</label>
            <input
              name="description"
              required
              placeholder="e.g. Tesco shop"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Merchant</label>
              <input
                name="merchant"
                placeholder="optional"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Category</label>
              <select
                name="categoryId"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Date</label>
              <input
                name="date"
                type="date"
                defaultValue={today}
                required
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Amount</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Direction</label>
              <select
                name="direction"
                defaultValue="expense"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            Add transaction
          </button>
        </form>
      </div>
    </div>
  );
}
