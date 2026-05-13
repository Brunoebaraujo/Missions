import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGroupByIdForUser } from "@/lib/groups/queries";
import { createTask } from "@/lib/tasks/actions";
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
            Default unit
            <input name="default_unit" defaultValue="completion" maxLength={40} required />
          </label>
          <label>
            Default quantity
            <input name="default_quantity" type="number" min="0.01" step="0.01" />
          </label>
          <label>
            Verification type
            <select name="verification_type" defaultValue="self_report" required>
              <option value="self_report">Self report</option>
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
