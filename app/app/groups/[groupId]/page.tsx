import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentUserGroup, getGroupMembership } from "@/lib/groups/queries";
import { hasGroupRole, isGroupMember } from "@/lib/groups/rbac";

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
  const [group, membership] = await Promise.all([
    getCurrentUserGroup(groupId, user.id),
    getGroupMembership(groupId, user.id),
  ]);

  if (!group || !isGroupMember(membership)) {
    notFound();
  }

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="group-title">
        <p className="eyebrow">Group</p>
        <h1 id="group-title">{group.name}</h1>
        <p className="summary">
          This is the protected group space. Missions, XP, rankings, and campaigns are
          intentionally not implemented yet.
        </p>
        <dl className="detail-list">
          <div>
            <dt>Slug</dt>
            <dd>/{group.slug}</dd>
          </div>
          <div>
            <dt>Your role</dt>
            <dd>{membership.role}</dd>
          </div>
          <div>
            <dt>Admin access</dt>
            <dd>
              {hasGroupRole(membership, ["owner", "admin"]) ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
        {group.description ? (
          <p className="group-description">{group.description}</p>
        ) : null}
        <p className="secondary-link">
          <Link href="/app/groups">Back to groups</Link>
        </p>
      </section>
    </main>
  );
}
