import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";
import { userCanManageGroupMissions } from "@/lib/missions/permissions";
import { getGroupMissions } from "@/lib/missions/queries";

type GroupMissionsPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

function formatMissionValue(value: string) {
  return value.replaceAll("_", " ");
}

export default async function GroupMissionsPage({
  params,
  searchParams,
}: GroupMissionsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { groupId } = await params;
  const groupForUser = await getGroupByIdForUser(groupId, user.id);

  if (!groupForUser) {
    notFound();
  }

  const paramsValue = await searchParams;
  const { group, membership } = groupForUser;
  const canManageMissions = userCanManageGroupMissions(membership);
  const missions = await getGroupMissions(group.id, user.id);

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="missions-title">
        <p className="eyebrow">Missions</p>
        <div className="page-header">
          <div>
            <h1 id="missions-title">{group.name} missions</h1>
            <p className="summary summary-left">
              Objective containers composed from the group task library and simple completion rules.
            </p>
          </div>
          {canManageMissions ? <Link href={`/app/groups/${group.id}/missions/new`}>Create mission</Link> : null}
        </div>

        {paramsValue?.message ? <p className="form-message">{paramsValue.message}</p> : null}

        {missions.length > 0 ? (
          <ul className="card-list" aria-label="Active missions">
            {missions.map((mission) => (
              <li key={mission.id} className="list-card mission-card">
                <Link href={`/app/groups/${group.id}/missions/${mission.id}`}>
                  <span>{mission.title}</span>
                  <small>{mission.description ?? "No description"}</small>
                </Link>
                <dl className="task-meta">
                  <div>
                    <dt>Type</dt>
                    <dd>{formatMissionValue(mission.missionType)}</dd>
                  </div>
                  <div>
                    <dt>Completion</dt>
                    <dd>{formatMissionValue(mission.completionMode)}</dd>
                  </div>
                  <div>
                    <dt>Required</dt>
                    <dd>{mission.requiredCompletions ?? "Task rule"}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No missions yet.</p>
            <p>Create a mission by selecting one or more existing group tasks.</p>
            {canManageMissions ? (
              <p>
                <Link href={`/app/groups/${group.id}/missions/new`}>Create mission</Link>
              </p>
            ) : null}
          </div>
        )}

        <p className="secondary-link">
          <Link href={`/app/groups/${group.id}`}>Back to group</Link>
        </p>
      </section>
    </main>
  );
}
