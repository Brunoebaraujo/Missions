import type { DefaultUnit, IconKey, Task, VerificationType } from "./types";

type TaskRow = {
  id: string;
  group_id: string;
  created_by_user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  default_unit: DefaultUnit;
  default_quantity: number | null;
  verification_type: VerificationType;
  icon_key: IconKey | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    groupId: row.group_id,
    createdByUserId: row.created_by_user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    defaultUnit: row.default_unit,
    defaultQuantity: row.default_quantity,
    verificationType: row.verification_type,
    iconKey: row.icon_key,
    imageUrl: row.image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
