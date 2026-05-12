import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Phase 1</p>
        <h1 id="page-title">Missions</h1>
        <p className="summary">
          A minimal application scaffold with Supabase authentication wiring.
        </p>
        <p>
          <Link href="/sign-in">Sign in</Link> or{" "}
          <Link href="/sign-up">create an account</Link>.
        </p>
      </section>
    </main>
  );
}
