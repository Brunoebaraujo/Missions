import type { Task } from "@/lib/tasks/types";

export type MissionType = "one_time" | "recurring";

export type CompletionMode = "total_completions" | "all_tasks_once";

export type Mission = {
  id: string;
  groupId: string;
  createdByUserId: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  missionType: MissionType;
  completionMode: CompletionMode;
  requiredCompletions: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MissionTask = {
  id: string;
  missionId: string;
  taskId: string;
  requiredQuantity: number | null;
  createdAt: string;
  task: Task;
};
