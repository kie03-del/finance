import { auth } from "@/auth";
import { getUserHousehold, getNetWorthSummary, getCategorySpendThisMonth, getRecentTransactions } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { CategorySpendChart } from "@/components/CategorySpendChart";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const [netWorth, categorySpend, recentTransactions] = await Promise.all([
    getNetWorthSummary(household.id),
    getCategorySpendThisMonth(household.id),
    getRecentTransactions(household.id),
  ]);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">Dashboard</h1>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 p-8 mb-8">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Net Worth</p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">{formatCurrency(netWorth.netWorth)}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.entries(netWorth.byMember).map(([memberName, amount]) => (
            <div key={memberName} className="rounded-lg bg-white dark:bg-slate-800 p-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{memberName}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">{formatCurrency(amount)}</p>
            </div>
          ))}
          <div className="rounded-lg bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Joint</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">{formatCurrency(netWorth.joint)}</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Business</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">{formatCurrency(netWorth.business)}</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Savings Pots</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">{formatCurrency(netWorth.potsTotal)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">Where it&apos;s going this month</h2>
          <CategorySpendChart data={categorySpend} />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">Recent transactions</h2>
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
            {recentTransactions.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                No transactions logged yet.
              </p>
            )}
            {recentTransactions.map((tx: typeof recentTransactions[number]) => (
              <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{tx.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatDate(tx.date)} · {tx.account.name}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm font-semibold ${
                    tx.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-slate-50"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {formatCurrency(tx.amount, tx.account.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
