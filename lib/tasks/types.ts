export type VerificationType = "none" | "self_report" | "photo" | "review_required";

export type Task = {
  id: string;
  groupId: string;
  createdByUserId: string;
  title: string;
  description: string | null;
  category: string | null;
  defaultUnit: string;
  defaultQuantity: number | null;
  verificationType: VerificationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
