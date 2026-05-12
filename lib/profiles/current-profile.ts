import { createClient } from "@/lib/supabase/server";
import type { Profile } from "./types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: getStringMetadata(user.user_metadata, "full_name"),
    avatarUrl: getStringMetadata(user.user_metadata, "avatar_url"),
    createdAt: user.created_at ?? null,
  };
}

function getStringMetadata(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}
