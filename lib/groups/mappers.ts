import type {
  Group,
  GroupMembership,
  GroupVisibility,
  MembershipRole,
  MembershipStatus,
} from "./types";

type GroupRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_user_id: string;
  visibility: GroupVisibility;
  created_at: string;
  updated_at: string;
};

type GroupMembershipRow = {
  id: string;
  group_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string;
  created_at: string;
};

export function mapGroup(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    ownerUserId: row.owner_user_id,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGroupMembership(row: GroupMembershipRow): GroupMembership {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    createdAt: row.created_at,
  };
}
