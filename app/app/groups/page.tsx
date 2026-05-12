import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listCurrentUserGroups } from "@/lib/groups/queries";

export default async function GroupsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const groups = await listCurrentUserGroups(user.id);

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="groups-title">
        <p className="eyebrow">Groups</p>
        <div className="page-header">
          <div>
            <h1 id="groups-title">Your groups</h1>
            <p className="summary summary-left">
              Groups define the tenant boundary for missions, XP, rankings, and future work.
            </p>
          </div>
          <Link className="button-link" href="/app/groups/new">
            New group
          </Link>
        </div>

        {groups.length > 0 ? (
          <ul className="card-list" aria-label="Groups you belong to">
            {groups.map((group) => (
              <li key={group.id} className="list-card">
                <Link href={`/app/groups/${group.id}`}>
                  <span>{group.name}</span>
                  <small>/{group.slug}</small>
                </Link>
                {group.description ? <p>{group.description}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>You do not belong to any groups yet.</p>
            <Link href="/app/groups/new">Create your first group</Link>
          </div>
        )}
      </section>
    </main>
  );
}
