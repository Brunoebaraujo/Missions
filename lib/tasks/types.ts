export type DefaultUnit = "completion" | "minutes" | "pages" | "reps" | "liters" | "custom";

export type VerificationType =
  | "self_report"
  | "photo_required"
  | "admin_approval"
  | "photo_and_admin_approval";

export type IconKey =
  | "bed"
  | "toothbrush"
  | "book"
  | "backpack"
  | "dishes"
  | "trash"
  | "broom"
  | "shower"
  | "workout"
  | "water"
  | "homework"
  | "pet"
  | "food"
  | "music"
  | "star";

export type Task = {
  id: string;
  groupId: string;
  createdByUserId: string;
  title: string;
  description: string | null;
  category: string | null;
  defaultUnit: DefaultUnit;
  defaultQuantity: number | null;
  verificationType: VerificationType;
  iconKey: IconKey | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
