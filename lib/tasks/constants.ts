import type { DefaultUnit, IconKey, VerificationType } from "./types";

export const TASK_UNIT_OPTIONS: DefaultUnit[] = [
  "completion",
  "minutes",
  "pages",
  "reps",
  "liters",
  "custom",
];

export const TASK_VERIFICATION_OPTIONS: Array<{
  label: string;
  value: VerificationType;
}> = [
  { label: "Self report", value: "self_report" },
  { label: "Photo required", value: "photo_required" },
  { label: "Admin approval", value: "admin_approval" },
  { label: "Photo + admin approval", value: "photo_and_admin_approval" },
];

export const DEFAULT_TASK_VERIFICATION_TYPE: VerificationType = "photo_and_admin_approval";
export const DEFAULT_TASK_UNIT: DefaultUnit = "completion";

export const TASK_ICON_OPTIONS: Array<{
  emoji: string;
  label: string;
  value: IconKey;
}> = [
  { emoji: "🛏️", label: "Bed", value: "bed" },
  { emoji: "🪥", label: "Toothbrush", value: "toothbrush" },
  { emoji: "📚", label: "Book", value: "book" },
  { emoji: "🎒", label: "Backpack", value: "backpack" },
  { emoji: "🍽️", label: "Dishes", value: "dishes" },
  { emoji: "🗑️", label: "Trash", value: "trash" },
  { emoji: "🧹", label: "Broom", value: "broom" },
  { emoji: "🚿", label: "Shower", value: "shower" },
  { emoji: "💪", label: "Workout", value: "workout" },
  { emoji: "💧", label: "Water", value: "water" },
  { emoji: "✏️", label: "Homework", value: "homework" },
  { emoji: "🐾", label: "Pet", value: "pet" },
  { emoji: "🍎", label: "Food", value: "food" },
  { emoji: "🎵", label: "Music", value: "music" },
  { emoji: "⭐", label: "Star", value: "star" },
];

export function getTaskIconEmoji(iconKey: IconKey | null) {
  return TASK_ICON_OPTIONS.find((icon) => icon.value === iconKey)?.emoji ?? null;
}

export function getTaskVerificationLabel(verificationType: VerificationType) {
  return (
    TASK_VERIFICATION_OPTIONS.find((option) => option.value === verificationType)?.label ??
    verificationType.replaceAll("_", " ")
  );
}
