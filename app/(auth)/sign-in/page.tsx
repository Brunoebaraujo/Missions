import Link from "next/link";
import { signIn } from "@/lib/auth/actions";

type SignInPageProps = {
  searchParams?: Promise<{ message?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const message = (await searchParams)?.message;

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="sign-in-title">
        <p className="eyebrow">Missions</p>
        <h1 id="sign-in-title">Sign in</h1>
        <p className="summary">Use your Supabase account to continue.</p>
        {message ? <p role="status">{message}</p> : null}
        <form action={signIn} className="auth-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit">Sign in</button>
        </form>
        <p>
          Need an account? <Link href="/sign-up">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
