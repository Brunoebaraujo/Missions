import { createClient } from "@/lib/supabase/server";
import { mapGroup, mapGroupMembership } from "./mappers";
import type { Group, GroupMembership } from "./types";

export async function listCurrentUserGroups(userId: string): Promise<Group[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, slug, description, owner_user_id, visibility, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load groups for user ${userId}: ${error.message}`);
  }

  return (data ?? []).map(mapGroup);
}

export async function getCurrentUserGroup(
  groupId: string,
  userId: string,
): Promise<Group | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, slug, description, owner_user_id, visibility, created_at, updated_at")
    .eq("id", groupId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load group ${groupId} for user ${userId}: ${error.message}`);
  }

  return data ? mapGroup(data) : null;
}

export async function getGroupMembership(
  groupId: string,
  userId: string,
): Promise<GroupMembership | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_memberships")
    .select("id, group_id, user_id, role, status, joined_at, created_at")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load group membership: ${error.message}`);
  }

  return data ? mapGroupMembership(data) : null;
}
