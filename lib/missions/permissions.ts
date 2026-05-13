import { hasGroupRole } from "@/lib/groups/rbac";
import type { GroupMembership } from "@/lib/groups/types";

export function userCanManageGroupMissions(
  membership: GroupMembership | null | undefined,
) {
  return hasGroupRole(membership, ["owner", "admin", "moderator"]);
}
