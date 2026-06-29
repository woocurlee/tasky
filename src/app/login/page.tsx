import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "로그인 · Tasky",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/[0.12] via-zinc-50 to-zinc-50 px-4 dark:via-zinc-950 dark:to-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-lg font-bold text-accent-foreground shadow-sm">
            T
          </span>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tasky</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">로그인이 필요합니다</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
