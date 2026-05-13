import { createClient } from "@/lib/supabase/server";
import { mapMission, mapMissionTask } from "./mappers";
import type { Mission, MissionTask } from "./types";

const MISSION_COLUMNS =
  "id, group_id, created_by_user_id, title, description, start_date, end_date, mission_type, completion_mode, required_completions, is_active, created_at, updated_at";

const TASK_COLUMNS =
  "id, group_id, created_by_user_id, title, description, category, default_unit, default_quantity, verification_type, icon_key, image_url, is_active, created_at, updated_at";

export async function getGroupMissions(
  groupId: string,
  userId: string,
): Promise<Mission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("missions")
    .select(MISSION_COLUMNS)
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load missions for group ${groupId} and user ${userId}: ${error.message}`);
  }

  return (data ?? []).map(mapMission);
}

export async function getMissionById(
  groupId: string,
  missionId: string,
  userId: string,
): Promise<Mission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("missions")
    .select(MISSION_COLUMNS)
    .eq("id", missionId)
    .eq("group_id", groupId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load mission ${missionId} for user ${userId}: ${error.message}`);
  }

  return data ? mapMission(data) : null;
}

export async function getMissionTasks(
  missionId: string,
  userId: string,
): Promise<MissionTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mission_tasks")
    .select(
      `id, mission_id, task_id, required_quantity, created_at, task:tasks(${TASK_COLUMNS})`,
    )
    .eq("mission_id", missionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load mission tasks for mission ${missionId} and user ${userId}: ${error.message}`);
  }

  return (data ?? []).flatMap((row) => {
    const task = Array.isArray(row.task) ? row.task[0] : row.task;

    if (!task) {
      return [];
    }

    return [mapMissionTask({ ...row, task })];
  });
}
