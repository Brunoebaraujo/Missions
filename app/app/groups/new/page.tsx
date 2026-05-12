import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createGroup } from "@/lib/groups/actions";

type NewGroupPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function NewGroupPage({ searchParams }: NewGroupPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="new-group-title">
        <p className="eyebrow">Create group</p>
        <h1 id="new-group-title">Start a group</h1>
        <p className="summary">
          Create the private tenant space your future missions and members will belong to.
        </p>
        {params?.message ? <p className="form-message">{params.message}</p> : null}
        <form className="auth-form" action={createGroup}>
          <label>
            Group name
            <input name="name" minLength={2} maxLength={80} required />
          </label>
          <label>
            Description
            <textarea name="description" maxLength={280} rows={4} />
          </label>
          <button type="submit">Create group</button>
        </form>
        <p className="secondary-link">
          <Link href="/app/groups">Back to groups</Link>
        </p>
      </section>
    </main>
  );
}
