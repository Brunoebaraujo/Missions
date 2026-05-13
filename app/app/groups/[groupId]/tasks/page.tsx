import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";
import { archiveTask } from "@/lib/tasks/actions";
import { getTaskIconEmoji, getTaskVerificationLabel } from "@/lib/tasks/constants";
import { userCanManageGroupTasks } from "@/lib/tasks/permissions";
import { getGroupTasks } from "@/lib/tasks/queries";

type GroupTasksPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function GroupTasksPage({
  params,
  searchParams,
}: GroupTasksPageProps) {
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
  const canManageTasks = userCanManageGroupTasks(membership);
  const tasks = await getGroupTasks(group.id, user.id);

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="tasks-title">
        <p className="eyebrow">Tasks</p>
        <div className="page-header">
          <div>
            <h1 id="tasks-title">{group.name} tasks</h1>
            <p className="summary summary-left">
              Reusable atomic actions for this group. Missions will be composed from tasks later.
            </p>
          </div>
          {canManageTasks ? <Link href={`/app/groups/${group.id}/tasks/new`}>Create task</Link> : null}
        </div>

        {paramsValue?.message ? <p className="form-message">{paramsValue.message}</p> : null}

        {tasks.length > 0 ? (
          <ul className="card-list" aria-label="Active tasks">
            {tasks.map((task) => {
              const canArchiveTask = canManageTasks || task.createdByUserId === user.id;

              const iconEmoji = getTaskIconEmoji(task.iconKey);

              return (
                <li key={task.id} className="list-card task-card">
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
                      <dt>Category</dt>
                      <dd>{task.category ?? "None"}</dd>
                    </div>
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
                  {canArchiveTask ? (
                    <form action={archiveTask} className="inline-form">
                      <input type="hidden" name="groupId" value={group.id} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <button type="submit" className="secondary-button">
                        Archive
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No active tasks yet.</p>
            <p>Create a reusable task library before missions are added in a later phase.</p>
            {canManageTasks ? (
              <p>
                <Link href={`/app/groups/${group.id}/tasks/new`}>Create task</Link>
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
