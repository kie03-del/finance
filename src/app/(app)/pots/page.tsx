import { auth } from "@/auth";
import { getUserHousehold } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { createPot, contributeToPot, deletePot } from "./actions";
import { redirect } from "next/navigation";

export default async function PotsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">Savings Pots</h1>

      <div className="grid gap-4 mb-10 sm:grid-cols-2">
        {household.pots.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No pots yet — create one below to start saving together.
          </p>
        )}
        {household.pots.map((pot) => {
          const progress = pot.targetAmount
            ? Math.min(100, (pot.currentAmount / pot.targetAmount) * 100)
            : null;

          return (
            <div
              key={pot.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{pot.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatCurrency(pot.currentAmount)}
                    {pot.targetAmount ? ` of ${formatCurrency(pot.targetAmount)}` : ""}
                  </p>
                </div>
                <form action={deletePot}>
                  <input type="hidden" name="id" value={pot.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </form>
              </div>

              {progress !== null && (
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: pot.color }}
                  />
                </div>
              )}

              <form action={contributeToPot} className="flex items-center gap-2">
                <input type="hidden" name="potId" value={pot.id} />
                <select
                  name="memberId"
                  required
                  className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {household.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  required
                  className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 max-w-lg">
        <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">Create pot</h2>
        <form action={createPot} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Holiday, House deposit"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Target amount (optional)</label>
            <input
              name="targetAmount"
              type="number"
              step="0.01"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            Create pot
          </button>
        </form>
      </div>
    </div>
  );
}
