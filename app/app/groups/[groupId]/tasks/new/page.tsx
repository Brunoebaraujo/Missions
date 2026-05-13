import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";
import { createTask } from "@/lib/tasks/actions";
import {
  DEFAULT_TASK_UNIT,
  DEFAULT_TASK_VERIFICATION_TYPE,
  TASK_ICON_OPTIONS,
  TASK_UNIT_OPTIONS,
  TASK_VERIFICATION_OPTIONS,
} from "@/lib/tasks/constants";
import { userCanManageGroupTasks } from "@/lib/tasks/permissions";

type NewTaskPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function NewTaskPage({ params, searchParams }: NewTaskPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { groupId } = await params;
  const groupForUser = await getGroupByIdForUser(groupId, user.id);

  if (!groupForUser) {
    notFound();
  }

  if (!userCanManageGroupTasks(groupForUser.membership)) {
    redirect(`/app/groups/${groupId}/tasks?message=${encodeURIComponent("You do not have permission to create tasks for this group.")}`);
  }

  const paramsValue = await searchParams;

  return (
    <main className="shell shell-start">
      <section className="hero hero-wide" aria-labelledby="new-task-title">
        <p className="eyebrow">Create task</p>
        <h1 id="new-task-title">New task</h1>
        <p className="summary summary-left">
          Add an atomic reusable action for {groupForUser.group.name}.
        </p>
        {paramsValue?.message ? <p className="form-message">{paramsValue.message}</p> : null}
        <form className="auth-form" action={createTask}>
          <input type="hidden" name="groupId" value={groupForUser.group.id} />
          <label>
            Title
            <input name="title" minLength={2} maxLength={120} required />
          </label>
          <label>
            Description
            <textarea name="description" maxLength={500} rows={4} />
          </label>
          <label>
            Category
            <input name="category" maxLength={80} />
          </label>
          <label>
            Icon
            <select name="icon_key" defaultValue="">
              <option value="">No icon</option>
              {TASK_ICON_OPTIONS.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.emoji} {icon.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Custom image URL optional
            <input name="image_url" type="url" placeholder="https://example.com/task.jpg" />
            <span className="field-help">
              Upload support will be added later. For now, paste an image URL if needed.
            </span>
          </label>
          <label>
            Unit
            <select name="default_unit" defaultValue={DEFAULT_TASK_UNIT} required>
              {TASK_UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="secondary-field">
            Target amount (optional)
            <input name="default_quantity" type="number" min="0.01" step="0.01" />
            <span className="field-help">
              Use only for measurable tasks, like 10 pages, 30 minutes, or 2 liters.
            </span>
          </label>
          <label>
            Verification type
            <select name="verification_type" defaultValue={DEFAULT_TASK_VERIFICATION_TYPE} required>
              {TASK_VERIFICATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Create task</button>
        </form>
        <p className="secondary-link">
          <Link href={`/app/groups/${groupForUser.group.id}/tasks`}>Back to tasks</Link>
        </p>
      </section>
    </main>
  );
}
