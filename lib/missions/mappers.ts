import { mapTask } from "@/lib/tasks/mappers";
import type { Task } from "@/lib/tasks/types";
import type { CompletionMode, Mission, MissionTask, MissionType } from "./types";

type MissionRow = {
  id: string;
  group_id: string;
  created_by_user_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  mission_type: MissionType;
  completion_mode: CompletionMode;
  required_completions: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type MissionTaskRow = {
  id: string;
  mission_id: string;
  task_id: string;
  required_quantity: number | null;
  created_at: string;
  task: Parameters<typeof mapTask>[0];
};

export function mapMission(row: MissionRow): Mission {
  return {
    id: row.id,
    groupId: row.group_id,
    createdByUserId: row.created_by_user_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    missionType: row.mission_type,
    completionMode: row.completion_mode,
    requiredCompletions: row.required_completions,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMissionTask(row: MissionTaskRow): MissionTask {
  return {
    id: row.id,
    missionId: row.mission_id,
    taskId: row.task_id,
    requiredQuantity: row.required_quantity,
    createdAt: row.created_at,
    task: mapTask(row.task) as Task,
  };
}
