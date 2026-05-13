import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";
import { getMissionById, getMissionTasks } from "@/lib/missions/queries";
import { getTaskIconEmoji, getTaskVerificationLabel } from "@/lib/tasks/constants";

type MissionDetailPageProps = {
  params: Promise<{
    groupId: string;
    missionId: string;
  }>;
};

function formatMissionValue(value: string) {
  return value.replaceAll("_", " ");
}

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { groupId, missionId } = await params;
  const groupForUser = await getGroupByIdForUser(groupId, user.id);

  if (!groupForUser) {
    notFound();
  }

  const mission = await getMissionById(groupForUser.group.id, missionId, user.id);

  if (!mission) {
    notFound();
  }

  const missionTasks = await getMissionTasks(mission.id, user.id);

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="mission-title">
        <p className="eyebrow">Mission</p>
        <h1 id="mission-title">{mission.title}</h1>
        {mission.description ? (
          <p className="summary summary-left">{mission.description}</p>
        ) : null}

        <dl className="detail-list">
          <div>
            <dt>Type</dt>
            <dd>{formatMissionValue(mission.missionType)}</dd>
          </div>
          <div>
            <dt>Completion mode</dt>
            <dd>{formatMissionValue(mission.completionMode)}</dd>
          </div>
          <div>
            <dt>Required completions</dt>
            <dd>{mission.requiredCompletions ?? "Task rule"}</dd>
          </div>
        </dl>

        <section className="linked-section" aria-labelledby="linked-tasks-title">
          <h2 id="linked-tasks-title">Linked tasks</h2>
          {missionTasks.length > 0 ? (
            <ul className="card-list" aria-label="Linked mission tasks">
              {missionTasks.map((missionTask) => {
                const task = missionTask.task;
                const iconEmoji = getTaskIconEmoji(task.iconKey);

                return (
                  <li key={missionTask.id} className="list-card task-card">
                    <div className="task-card-header">
                      {task.imageUrl ? (
                        <span
                          aria-label={`${task.title} custom image preview`}
                          className="task-image-preview"
                          role="img"
                          style={{ backgroundImage: `url(${task.imageUrl})` }}
                        />
                      ) : null}
                      {iconEmoji ? (
                        <span aria-hidden="true" className="task-icon">
                          {iconEmoji}
                        </span>
                      ) : null}
                      <div>
                        <strong>{task.title}</strong>
                        {task.category ? <small>{task.category}</small> : null}
                      </div>
                    </div>
                    {task.description ? <p>{task.description}</p> : null}
                    <dl className="task-meta">
                      <div>
                        <dt>Unit</dt>
                        <dd>
                          {task.defaultQuantity ? `${task.defaultQuantity} ${task.defaultUnit}` : task.defaultUnit}
                        </dd>
                      </div>
                      <div>
                        <dt>Verification</dt>
                        <dd>{getTaskVerificationLabel(task.verificationType)}</dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No tasks are linked to this mission.</p>
            </div>
          )}
        </section>

        <div className="empty-state mission-placeholder">
          <p>Task completion will be added in the next phase.</p>
        </div>

        <p className="secondary-link">
          <Link href={`/app/groups/${groupForUser.group.id}/missions`}>Back to missions</Link>
        </p>
      </section>
    </main>
  );
}
