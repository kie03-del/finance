import Link from "next/link";
import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/pots", label: "Savings Pots" },
  { href: "/business", label: "Business" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-1 min-h-screen bg-white dark:bg-slate-950">
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 bg-slate-50 dark:bg-slate-900">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">Finance</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {session?.user?.name}
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm flex-1">
          {NAV_LINKS.map((link: typeof NAV_LINKS[number]) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full text-left rounded-lg px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
