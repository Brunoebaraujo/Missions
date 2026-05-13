"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGroupMembership } from "@/lib/groups/queries";
import { createClient } from "@/lib/supabase/server";
import {
  COMPLETION_MODE_OPTIONS,
  DEFAULT_COMPLETION_MODE,
  DEFAULT_MISSION_TYPE,
  MISSION_TYPE_OPTIONS,
} from "./constants";
import { userCanManageGroupMissions } from "./permissions";
import type { CompletionMode, MissionType } from "./types";

const ALLOWED_MISSION_TYPES = MISSION_TYPE_OPTIONS.map((option) => option.value);
const ALLOWED_COMPLETION_MODES = COMPLETION_MODE_OPTIONS.map((option) => option.value);

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getFormValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function parseOptionalCompletions(value: string) {
  if (!value) {
    return null;
  }

  const completions = Number(value);

  if (!Number.isInteger(completions) || completions <= 0) {
    return null;
  }

  return completions;
}

export async function createMission(formData: FormData) {
  const groupId = getFormValue(formData, "groupId");
  const title = getFormValue(formData, "title");
  const description = getFormValue(formData, "description");
  const missionTypeValue = getFormValue(formData, "mission_type") || DEFAULT_MISSION_TYPE;
  const completionModeValue = getFormValue(formData, "completion_mode") || DEFAULT_COMPLETION_MODE;
  const requiredCompletionsValue = getFormValue(formData, "required_completions");
  const taskIds = Array.from(new Set(getFormValues(formData, "taskIds")));
  const newMissionPath = `/app/groups/${groupId}/missions/new`;

  if (!groupId) {
    redirectWithMessage("/app/groups", "Choose a group before creating a mission.");
  }

  if (title.length < 2 || title.length > 120) {
    redirectWithMessage(newMissionPath, "Mission title must be between 2 and 120 characters.");
  }

  if (description.length > 800) {
    redirectWithMessage(newMissionPath, "Description must be 800 characters or fewer.");
  }

  if (!ALLOWED_MISSION_TYPES.includes(missionTypeValue as MissionType)) {
    redirectWithMessage(newMissionPath, "Choose one of the available mission types.");
  }

  const missionType = missionTypeValue as MissionType;

  if (!ALLOWED_COMPLETION_MODES.includes(completionModeValue as CompletionMode)) {
    redirectWithMessage(newMissionPath, "Choose one of the available completion modes.");
  }

  const completionMode = completionModeValue as CompletionMode;
  const requiredCompletions = parseOptionalCompletions(requiredCompletionsValue);

  if (requiredCompletionsValue && requiredCompletions === null) {
    redirectWithMessage(newMissionPath, "Required completions must be a positive whole number when provided.");
  }

  if (completionMode === "total_completions" && requiredCompletions === null) {
    redirectWithMessage(newMissionPath, "Required completions are needed for total completion missions.");
  }

  if (taskIds.length === 0) {
    redirectWithMessage(newMissionPath, "Choose at least one group task for this mission.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const membership = await getGroupMembership(groupId, user.id);

  if (!userCanManageGroupMissions(membership)) {
    redirectWithMessage(`/app/groups/${groupId}/missions`, "You do not have permission to create missions for this group.");
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id")
    .eq("group_id", groupId)
    .eq("is_active", true)
    .in("id", taskIds);

  if (tasksError) {
    redirectWithMessage(newMissionPath, tasksError.message);
  }

  if ((tasks ?? []).length !== taskIds.length) {
    redirectWithMessage(newMissionPath, "Mission tasks must be active tasks from this group.");
  }

  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .insert({
      group_id: groupId,
      created_by_user_id: user.id,
      title,
      description: description || null,
      mission_type: missionType,
      completion_mode: completionMode,
      required_completions: requiredCompletions,
    })
    .select("id")
    .single();

  if (missionError) {
    redirectWithMessage(newMissionPath, missionError.message);
  }

  const { error: missionTasksError } = await supabase.from("mission_tasks").insert(
    taskIds.map((taskId) => ({
      mission_id: mission.id,
      task_id: taskId,
      required_quantity: null,
    })),
  );

  if (missionTasksError) {
    redirectWithMessage(newMissionPath, missionTasksError.message);
  }

  revalidatePath(`/app/groups/${groupId}/missions`);
  redirect(`/app/groups/${groupId}/missions/${mission.id}`);
}
