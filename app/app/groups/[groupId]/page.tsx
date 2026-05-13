import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";

type GroupPageProps = {
  params: Promise<{
    groupId: string;
  }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { groupId } = await params;
  const groupForUser = await getGroupByIdForUser(groupId, user.id);

  if (!groupForUser) {
    notFound();
  }

  const { group, membership } = groupForUser;

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="group-title">
        <p className="eyebrow">Group</p>
        <h1 id="group-title">{group.name}</h1>
        {group.description ? (
          <p className="summary summary-left">{group.description}</p>
        ) : null}
        <dl className="detail-list">
          <div>
            <dt>Your role</dt>
            <dd>{membership.role}</dd>
          </div>
        </dl>
        <p className="group-actions">
          <Link href={`/app/groups/${group.id}/tasks`}>Tasks</Link>
          <Link href={`/app/groups/${group.id}/missions`}>Missions</Link>
        </p>
        <p className="group-placeholder">Create missions from reusable tasks to define group objectives.</p>
        <p className="secondary-link">
          <Link href="/app/groups">Back to groups</Link>
        </p>
      </section>
    </main>
  );
}
