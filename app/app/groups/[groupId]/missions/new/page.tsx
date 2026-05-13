import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";
import { createMission } from "@/lib/missions/actions";
import {
  COMPLETION_MODE_OPTIONS,
  DEFAULT_COMPLETION_MODE,
  DEFAULT_MISSION_TYPE,
  MISSION_TYPE_OPTIONS,
} from "@/lib/missions/constants";
import { userCanManageGroupMissions } from "@/lib/missions/permissions";
import { getGroupTasks } from "@/lib/tasks/queries";

type NewMissionPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function NewMissionPage({ params, searchParams }: NewMissionPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { groupId } = await params;
  const groupForUser = await getGroupByIdForUser(groupId, user.id);

  if (!groupForUser) {
    notFound();
  }

  if (!userCanManageGroupMissions(groupForUser.membership)) {
    redirect(`/app/groups/${groupId}/missions?message=${encodeURIComponent("You do not have permission to create missions for this group.")}`);
  }

  const paramsValue = await searchParams;
  const tasks = await getGroupTasks(groupForUser.group.id, user.id);

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="new-mission-title">
        <p className="eyebrow">Create mission</p>
        <h1 id="new-mission-title">New mission</h1>
        <p className="summary summary-left">
          Build an objective for {groupForUser.group.name} from existing atomic tasks.
        </p>
        {paramsValue?.message ? <p className="form-message">{paramsValue.message}</p> : null}
        {tasks.length > 0 ? (
          <form className="auth-form" action={createMission}>
            <input type="hidden" name="groupId" value={groupForUser.group.id} />
            <label>
              Title
              <input name="title" minLength={2} maxLength={120} required />
            </label>
            <label>
              Description
              <textarea name="description" maxLength={800} rows={4} />
            </label>
            <label>
              Mission type
              <select name="mission_type" defaultValue={DEFAULT_MISSION_TYPE} required>
                {MISSION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Completion mode
              <select name="completion_mode" defaultValue={DEFAULT_COMPLETION_MODE} required>
                {COMPLETION_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="field-help">
                Total completions uses a numeric target. All tasks once requires each selected task once.
              </span>
            </label>
            <label className="secondary-field">
              Required completions
              <input name="required_completions" type="number" min="1" step="1" />
              <span className="field-help">
                Required for total completions. Leave blank for all tasks once.
              </span>
            </label>
            <fieldset className="task-picker">
              <legend>Mission tasks</legend>
              <p className="field-help">Select one or more active tasks from this group.</p>
              {tasks.map((task) => (
                <label key={task.id} className="checkbox-row">
                  <input type="checkbox" name="taskIds" value={task.id} />
                  <span>
                    <strong>{task.title}</strong>
                    <small>
                      {task.defaultQuantity ? `${task.defaultQuantity} ${task.defaultUnit}` : task.defaultUnit}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="submit">Create mission</button>
          </form>
        ) : (
          <div className="empty-state">
            <p>No active tasks are available for missions yet.</p>
            <p>Create at least one task before creating a mission.</p>
            <p>
              <Link href={`/app/groups/${groupForUser.group.id}/tasks/new`}>Create task</Link>
            </p>
          </div>
        )}
        <p className="secondary-link">
          <Link href={`/app/groups/${groupForUser.group.id}/missions`}>Back to missions</Link>
        </p>
      </section>
    </main>
  );
}
