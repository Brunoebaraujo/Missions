"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGroupMembership } from "@/lib/groups/queries";
import { createClient } from "@/lib/supabase/server";
import { userCanManageGroupTasks } from "./permissions";
import type { VerificationType } from "./types";

const ALLOWED_VERIFICATION_TYPES: VerificationType[] = ["self_report"];

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function parseOptionalQuantity(value: string) {
  if (!value) {
    return null;
  }

  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return quantity;
}

export async function createTask(formData: FormData) {
  const groupId = getFormValue(formData, "groupId");
  const title = getFormValue(formData, "title");
  const description = getFormValue(formData, "description");
  const category = getFormValue(formData, "category");
  const defaultUnit = getFormValue(formData, "default_unit");
  const defaultQuantityValue = getFormValue(formData, "default_quantity");
  const verificationType = getFormValue(formData, "verification_type") as VerificationType;
  const newTaskPath = `/app/groups/${groupId}/tasks/new`;

  if (!groupId) {
    redirectWithMessage("/app/groups", "Choose a group before creating a task.");
  }

  if (title.length < 2 || title.length > 120) {
    redirectWithMessage(newTaskPath, "Task title must be between 2 and 120 characters.");
  }

  if (description.length > 500) {
    redirectWithMessage(newTaskPath, "Description must be 500 characters or fewer.");
  }

  if (category.length > 80) {
    redirectWithMessage(newTaskPath, "Category must be 80 characters or fewer.");
  }

  if (defaultUnit.length < 1 || defaultUnit.length > 40) {
    redirectWithMessage(newTaskPath, "Default unit must be between 1 and 40 characters.");
  }

  const defaultQuantity = parseOptionalQuantity(defaultQuantityValue);

  if (defaultQuantityValue && defaultQuantity === null) {
    redirectWithMessage(newTaskPath, "Default quantity must be a positive number when provided.");
  }

  if (!ALLOWED_VERIFICATION_TYPES.includes(verificationType)) {
    redirectWithMessage(newTaskPath, "Only self-report verification is available right now.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const membership = await getGroupMembership(groupId, user.id);

  if (!userCanManageGroupTasks(membership)) {
    redirectWithMessage(`/app/groups/${groupId}/tasks`, "You do not have permission to create tasks for this group.");
  }

  const { error } = await supabase.from("tasks").insert({
    group_id: groupId,
    created_by_user_id: user.id,
    title,
    description: description || null,
    category: category || null,
    default_unit: defaultUnit,
    default_quantity: defaultQuantity,
    verification_type: verificationType,
  });

  if (error) {
    redirectWithMessage(newTaskPath, error.message);
  }

  revalidatePath(`/app/groups/${groupId}/tasks`);
  redirect(`/app/groups/${groupId}/tasks`);
}

export async function archiveTask(formData: FormData) {
  const groupId = getFormValue(formData, "groupId");
  const taskId = getFormValue(formData, "taskId");

  if (!groupId || !taskId) {
    redirectWithMessage("/app/groups", "Choose a task to archive.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const membership = await getGroupMembership(groupId, user.id);
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("created_by_user_id")
    .eq("id", taskId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (taskError) {
    redirectWithMessage(`/app/groups/${groupId}/tasks`, taskError.message);
  }

  const canArchiveTask =
    task?.created_by_user_id === user.id || userCanManageGroupTasks(membership);

  if (!canArchiveTask) {
    redirectWithMessage(`/app/groups/${groupId}/tasks`, "You do not have permission to archive this task.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ is_active: false })
    .eq("id", taskId)
    .eq("group_id", groupId);

  if (error) {
    redirectWithMessage(`/app/groups/${groupId}/tasks`, error.message);
  }

  revalidatePath(`/app/groups/${groupId}/tasks`);
  redirect(`/app/groups/${groupId}/tasks`);
}
