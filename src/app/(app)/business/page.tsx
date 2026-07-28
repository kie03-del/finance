import { auth } from "@/auth";
import { getUserHousehold, getBusinessSummary } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function BusinessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const { income, expenses, profit, transactions } = await getBusinessSummary(household.id);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Business</h1>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1">Income</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(income)}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1">Expenses</p>
          <p className="text-xl font-semibold text-red-500">{formatCurrency(expenses)}</p>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1">Profit</p>
          <p
            className={`text-xl font-semibold ${
              profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"
            }`}
          >
            {formatCurrency(profit)}
          </p>
        </div>
      </div>

      <h2 className="text-sm font-medium text-black/60 dark:text-white/60 mb-2">
        Business transactions
      </h2>
      <div className="rounded-lg border border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10">
        {transactions.length === 0 && (
          <p className="text-sm text-black/50 dark:text-white/50 px-4 py-6">
            No business transactions yet. Mark an account as &quot;Business&quot; on the
            Accounts page, then log transactions against it here.
          </p>
        )}
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-sm">{tx.description}</p>
              <p className="text-xs text-black/50 dark:text-white/50">
                {formatDate(tx.date)} · {tx.account.name}
                {tx.category ? ` · ${tx.category.name}` : ""}
              </p>
            </div>
            <span
              className={`font-mono text-sm ${
                tx.amount >= 0 ? "text-green-600 dark:text-green-400" : ""
              }`}
            >
              {tx.amount >= 0 ? "+" : ""}
              {formatCurrency(tx.amount, tx.account.currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
