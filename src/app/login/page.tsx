import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      throw error;
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-950 dark:to-blue-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            Household Finance
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your money together
          </p>
        </div>

        {params.error && (
          <p className="mb-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-3 border border-red-200 dark:border-red-900">
            Invalid email or password.
          </p>
        )}

        <form action={authenticate} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 transition-colors shadow-md hover:shadow-lg"
          >
            Sign in
          </button>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center">
          Demo credentials: you@example.com / changeme123
        </p>
      </div>
    </div>
  );
}
