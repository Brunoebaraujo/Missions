import Link from "next/link";
import { signUp } from "@/lib/auth/actions";

type SignUpPageProps = {
  searchParams?: Promise<{ message?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const message = (await searchParams)?.message;

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="sign-up-title">
        <p className="eyebrow">Missions</p>
        <h1 id="sign-up-title">Sign up</h1>
        <p className="summary">Create a Supabase-backed Missions account.</p>
        {message ? <p role="status">{message}</p> : null}
        <form action={signUp} className="auth-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <button type="submit">Sign up</button>
        </form>
        <p>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
