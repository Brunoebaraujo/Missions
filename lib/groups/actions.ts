"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createGroupSlug } from "./slug";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function createGroup(formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");

  if (name.length < 2) {
    redirectWithMessage(
      "/app/groups/new",
      "Group name must be at least 2 characters.",
    );
  }

  if (name.length > 80) {
    redirectWithMessage(
      "/app/groups/new",
      "Group name must be 80 characters or fewer.",
    );
  }

  if (description.length > 280) {
    redirectWithMessage(
      "/app/groups/new",
      "Description must be 280 characters or fewer.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const groupId = crypto.randomUUID();
  const slug = `${createGroupSlug(name)}-${groupId.slice(0, 8)}`;
  const { error: groupError } = await supabase.from("groups").insert({
    id: groupId,
    name,
    slug,
    description: description || null,
    owner_user_id: user.id,
    visibility: "private",
  });

  if (groupError) {
    redirectWithMessage("/app/groups/new", groupError.message);
  }

  const { error: membershipError } = await supabase
    .from("group_memberships")
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: "owner",
      status: "active",
    });

  if (membershipError) {
    redirectWithMessage("/app/groups/new", membershipError.message);
  }

  redirect(`/app/groups/${groupId}`);
}
