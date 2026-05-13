export type MembershipRole = "owner" | "admin" | "moderator" | "member";

export type MembershipStatus = "active" | "invited" | "suspended" | "left";

export type GroupVisibility = "private" | "invite_only" | "public";

export type Group = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerUserId: string;
  visibility: GroupVisibility;
  createdAt: string;
  updatedAt: string;
};

export type GroupMembership = {
  id: string;
  groupId: string;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
  createdAt: string;
};
