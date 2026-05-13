import { createClient } from "@/lib/supabase/server";
import { mapTask } from "./mappers";
import type { Task } from "./types";

export async function getGroupTasks(
  groupId: string,
  userId: string,
): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, group_id, created_by_user_id, title, description, category, default_unit, default_quantity, verification_type, is_active, created_at, updated_at",
    )
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load tasks for group ${groupId} and user ${userId}: ${error.message}`);
  }

  return (data ?? []).map(mapTask);
}
