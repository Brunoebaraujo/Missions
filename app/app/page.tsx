import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { getCurrentUserProfile } from "@/lib/profiles/current-profile";

export default async function AppPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  const currentProfile = profile;

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="app-title">
        <p className="eyebrow">Authenticated</p>
        <h1 id="app-title">Missions app</h1>
        <p className="summary">
          You are signed in{currentProfile.email ? ` as ${currentProfile.email}` : ""}.
        </p>
        <form action={signOut}>
          <button type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}
