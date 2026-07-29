import { auth } from "@/auth";
import { getUserHousehold } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { createAccount, deleteAccount } from "./actions";
import { redirect } from "next/navigation";

const ACCOUNT_KINDS = ["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "LOAN", "CASH"];

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const household = await getUserHousehold(session.user.id);
  if (!household) redirect("/login");

  const groups: Record<string, typeof household.accounts> = {
    Joint: [],
    Business: [],
  };
  for (const member of household.members) {
    groups[member.name] = [];
  }

  for (const account of household.accounts) {
    if (account.ownerType === "JOINT") {
      groups.Joint.push(account);
    } else if (account.ownerType === "BUSINESS") {
      groups.Business.push(account);
    } else if (account.owner?.name) {
      groups[account.owner.name]?.push(account);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">Accounts</h1>

      <div className="grid gap-6 mb-10">
        {Object.entries(groups).map(
          ([groupName, groupAccounts]) =>
            groupAccounts.length > 0 && (
              <div key={groupName}>
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 px-1">
                  {groupName}
                </h2>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {groupAccounts.map((account: typeof household.accounts[number]) => (
                    <div key={account.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-50">{account.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {account.institution ?? "—"} · {account.kind.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-50">
                          {formatCurrency(account.balance, account.currency)}
                        </span>
                        <form action={deleteAccount}>
                          <input type="hidden" name="id" value={account.id} />
                          <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
        {household.accounts.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
            No accounts yet — add your first one below.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 max-w-lg">
        <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">Add account</h2>
        <form action={createAccount} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Monzo Current"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Institution</label>
              <input
                name="institution"
                placeholder="e.g. Monzo"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Type</label>
              <select
                name="kind"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ACCOUNT_KINDS.map((kind: string) => (
                  <option key={kind} value={kind}>
                    {kind.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Owner</label>
              <select
                name="ownerType"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PERSONAL">Personal</option>
                <option value="JOINT">Joint</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>
          </div>

          {household.members.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                If Personal, which person?
              </label>
              <select
                name="ownerId"
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {household.members.map((member: typeof household.members[number]) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Starting balance</label>
            <input
              name="balance"
              type="number"
              step="0.01"
              defaultValue={0}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            Add account
          </button>
        </form>
      </div>
    </div>
  );
}
