import { createClient } from "@/lib/supabase/server";
import { isGroupMember } from "./rbac";
import { mapGroup, mapGroupMembership } from "./mappers";
import type { Group, GroupMembership } from "./types";

type SupabaseQueryError = {
  code?: string;
  details?: string;
  message: string;
};

export type GroupForUser = {
  group: Group;
  membership: GroupMembership;
};

function isMissingGroupsSchemaError(error: SupabaseQueryError) {
  const errorText = [error.message, error.details].filter(Boolean).join(" ");

  return (
    (error.code === "42P01" || error.code === "PGRST205") &&
    /(?:public\.)?(?:groups|group_memberships)\b/i.test(errorText)
  );
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, slug, description, owner_user_id, visibility, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingGroupsSchemaError(error)) {
      return [];
    }

    throw new Error(`Unable to load groups for user ${userId}: ${error.message}`);
  }

  return (data ?? []).map(mapGroup);
}

export async function getGroupByIdForUser(
  groupId: string,
  userId: string,
): Promise<GroupForUser | null> {
  const supabase = await createClient();
  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .select("id, name, slug, description, owner_user_id, visibility, created_at, updated_at")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError) {
    throw new Error(`Unable to load group ${groupId} for user ${userId}: ${groupError.message}`);
  }

  if (!groupData) {
    return null;
  }

  const { data: membershipData, error: membershipError } = await supabase
    .from("group_memberships")
    .select("id, group_id, user_id, role, status, joined_at, created_at")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(`Unable to load group membership: ${membershipError.message}`);
  }

  const membership = membershipData ? mapGroupMembership(membershipData) : null;

  if (!isGroupMember(membership)) {
    return null;
  }

  return {
    group: mapGroup(groupData),
    membership,
  };
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

export const listCurrentUserGroups = getUserGroups;
export const getCurrentUserGroup = getGroupByIdForUser;
