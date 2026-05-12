import type { GroupMembership, MembershipRole } from "./types";

export function isGroupMember(
  membership: GroupMembership | null | undefined,
): membership is GroupMembership {
  return membership?.status === "active";
}

export function hasGroupRole(
  membership: GroupMembership | null | undefined,
  roles: MembershipRole | MembershipRole[],
) {
  if (!membership || !isGroupMember(membership)) {
    return false;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return allowedRoles.includes(membership.role);
}
