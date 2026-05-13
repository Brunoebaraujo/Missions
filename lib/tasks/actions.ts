"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGroupMembership } from "@/lib/groups/queries";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_TASK_UNIT,
  DEFAULT_TASK_VERIFICATION_TYPE,
  TASK_ICON_OPTIONS,
  TASK_UNIT_OPTIONS,
  TASK_VERIFICATION_OPTIONS,
} from "./constants";
import { userCanManageGroupTasks } from "./permissions";
import type { DefaultUnit, IconKey, VerificationType } from "./types";

const ALLOWED_ICON_KEYS = TASK_ICON_OPTIONS.map((icon) => icon.value);
const ALLOWED_VERIFICATION_TYPES = TASK_VERIFICATION_OPTIONS.map((option) => option.value);

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

function parseOptionalUrl(value: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function createTask(formData: FormData) {
  const groupId = getFormValue(formData, "groupId");
  const title = getFormValue(formData, "title");
  const description = getFormValue(formData, "description");
  const category = getFormValue(formData, "category");
  const defaultUnitValue = getFormValue(formData, "default_unit") || DEFAULT_TASK_UNIT;
  const defaultQuantityValue = getFormValue(formData, "default_quantity");
  const verificationTypeValue = getFormValue(formData, "verification_type") || DEFAULT_TASK_VERIFICATION_TYPE;
  const iconKeyValue = getFormValue(formData, "icon_key");
  const imageUrlValue = getFormValue(formData, "image_url");
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

  if (!TASK_UNIT_OPTIONS.includes(defaultUnitValue as DefaultUnit)) {
    redirectWithMessage(newTaskPath, "Choose one of the available unit options.");
  }

  const defaultUnit = defaultUnitValue as DefaultUnit;

  const defaultQuantity = parseOptionalQuantity(defaultQuantityValue);

  if (defaultQuantityValue && defaultQuantity === null) {
    redirectWithMessage(newTaskPath, "Default quantity must be a positive number when provided.");
  }

  if (!ALLOWED_VERIFICATION_TYPES.includes(verificationTypeValue as VerificationType)) {
    redirectWithMessage(newTaskPath, "Choose one of the available verification options.");
  }

  const verificationType = verificationTypeValue as VerificationType;

  if (iconKeyValue && !ALLOWED_ICON_KEYS.includes(iconKeyValue as IconKey)) {
    redirectWithMessage(newTaskPath, "Choose one of the available task icons.");
  }

  const imageUrl = parseOptionalUrl(imageUrlValue);

  if (imageUrlValue && imageUrl === null) {
    redirectWithMessage(newTaskPath, "Custom image URL must be a valid http or https URL.");
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
    icon_key: iconKeyValue || null,
    image_url: imageUrl,
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
