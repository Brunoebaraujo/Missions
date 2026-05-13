import type { CompletionMode, MissionType } from "./types";

export const MISSION_TYPE_OPTIONS: Array<{
  value: MissionType;
  label: string;
}> = [
  { value: "one_time", label: "One-time" },
  { value: "recurring", label: "Recurring" },
];

export const COMPLETION_MODE_OPTIONS: Array<{
  value: CompletionMode;
  label: string;
  description: string;
}> = [
  {
    value: "total_completions",
    label: "Total completions",
    description: "Complete any linked task until the mission target is met.",
  },
  {
    value: "all_tasks_once",
    label: "All tasks once",
    description: "Complete each linked task one time.",
  },
];

export const DEFAULT_MISSION_TYPE: MissionType = "one_time";
export const DEFAULT_COMPLETION_MODE: CompletionMode = "all_tasks_once";
