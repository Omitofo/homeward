"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/features/auth/session";
import type { ActionResult } from "@/features/auth/types";
import { getShelterForProfile } from "@/features/shelters";
import { createClient } from "@/lib/supabase/server";
import type { AnimalPost, PostMedia, ShelterSummary } from "@/types/domain";
import { postComposerSchema, type PostComposerInput } from "./schema";
import { addMockPost, getMockCreatedById } from "./mock-store";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

function ageGroupFromMonths(months: number): AnimalPost["ageGroup"] {
  if (months < 12) return "baby";
  if (months < 24) return "young";
  if (months < 96) return "adult";
  return "senior";
}

function shelterToSummary(s: {
  id: string;
  handle: string;
  orgName: string;
  avatarUrl: string | null;
  verificationStatus: ShelterSummary["verificationStatus"];
  city: string;
  region: string;
  countryCode: string;
}): ShelterSummary {
  return {
    id: s.id,
    handle: s.handle,
    orgName: s.orgName,
    avatarUrl: s.avatarUrl,
    verificationStatus: s.verificationStatus,
    city: s.city,
    region: s.region,
    countryCode: s.countryCode,
  };
}

async function requireOwnerShelter() {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in required" as const };
  if (profile.role !== "shelter" && profile.role !== "admin") {
    return { error: "Only rescue accounts can manage posts" as const };
  }
  const shelter = await getShelterForProfile(profile.id);
  if (!shelter) {
    return { error: "No shelter profile linked to this account" as const };
  }
  return { profile, shelter };
}

function mapMedia(input: PostComposerInput["media"]): PostMedia[] {
  return input.map((m, i) => ({
    id: m.id ?? randomUUID(),
    url: m.publicUrl,
    altText: m.altText || "",
    position: i,
    width: m.width,
    height: m.height,
  }));
}

export async function createAnimalPost(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireOwnerShelter();
  if ("error" in gate) return { ok: false, error: gate.error };

  const parsed = postComposerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  const data = parsed.data;
  const ageGroup = data.ageGroup || ageGroupFromMonths(data.ageMonths);

  if (useMock) {
    const id = `mock-${randomUUID().slice(0, 8)}`;
    const post: AnimalPost = {
      id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      ageMonths: data.ageMonths,
      ageGroup,
      size: data.size,
      description: data.description,
      status: data.status,
      traits: data.traits,
      countryCode: data.countryCode,
      region: data.region,
      city: data.city,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      media: mapMedia(data.media),
      shelter: shelterToSummary(gate.shelter),
    };
    addMockPost(post);
    revalidatePath("/studio");
    revalidatePath("/explore");
    return { ok: true, data: { id } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data: row, error: postError } = await supabase
    .from("animal_posts")
    .insert({
      shelter_id: gate.shelter.id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      age_months: data.ageMonths,
      age_group: ageGroup,
      size: data.size,
      description: data.description,
      country_code: data.countryCode,
      region: data.region,
      city: data.city,
      status: data.status,
      traits: data.traits,
    })
    .select("id")
    .single();

  if (postError || !row) {
    console.error("[createAnimalPost]", postError?.message);
    return { ok: false, error: "Could not create post. Try again." };
  }

  const mediaRows = data.media.map((m, i) => ({
    post_id: row.id,
    storage_path: m.storagePath.replace(/^mock\//, ""),
    position: i,
    alt_text: m.altText || "",
    width: m.width,
    height: m.height,
  }));

  const { error: mediaError } = await supabase
    .from("post_media")
    .insert(mediaRows);

  if (mediaError) {
    console.error("[createAnimalPost] media", mediaError.message);
  }

  revalidatePath("/studio");
  revalidatePath("/explore");
  revalidatePath(`/post/${row.id}`);
  return { ok: true, data: { id: row.id } };
}

export async function updateAnimalPost(
  postId: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireOwnerShelter();
  if ("error" in gate) return { ok: false, error: gate.error };

  const parsed = postComposerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  const data = parsed.data;
  const ageGroup = data.ageGroup || ageGroupFromMonths(data.ageMonths);

  if (useMock) {
    const existing = getMockCreatedById(postId);
    const base: AnimalPost = existing ?? {
      id: postId,
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      ageMonths: data.ageMonths,
      ageGroup,
      size: data.size,
      description: data.description,
      status: data.status,
      traits: data.traits,
      countryCode: data.countryCode,
      region: data.region,
      city: data.city,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      media: [],
      shelter: shelterToSummary(gate.shelter),
    };

    if (base.shelter.id !== gate.shelter.id) {
      return { ok: false, error: "You can only edit your own posts" };
    }

    const updated: AnimalPost = {
      ...base,
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      ageMonths: data.ageMonths,
      ageGroup,
      size: data.size,
      description: data.description,
      status: data.status,
      traits: data.traits,
      countryCode: data.countryCode,
      region: data.region,
      city: data.city,
      media: mapMedia(data.media),
    };
    addMockPost(updated);
    revalidatePath("/studio");
    revalidatePath(`/studio/post/${postId}`);
    revalidatePath(`/post/${postId}`);
    revalidatePath("/explore");
    return { ok: true, data: { id: postId } };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { data: updated, error: updError } = await supabase
    .from("animal_posts")
    .update({
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      age_months: data.ageMonths,
      age_group: ageGroup,
      size: data.size,
      description: data.description,
      country_code: data.countryCode,
      region: data.region,
      city: data.city,
      status: data.status,
      traits: data.traits,
    })
    .eq("id", postId)
    .eq("shelter_id", gate.shelter.id)
    .select("id")
    .maybeSingle();

  if (updError) {
    console.error("[updateAnimalPost]", updError.message);
    return { ok: false, error: "Could not update post. Try again." };
  }
  if (!updated) {
    return { ok: false, error: "Post not found or not owned by your shelter" };
  }

  await supabase.from("post_media").delete().eq("post_id", postId);

  const mediaRows = data.media.map((m, i) => ({
    post_id: postId,
    storage_path: m.storagePath.replace(/^mock\//, ""),
    position: i,
    alt_text: m.altText || "",
    width: m.width,
    height: m.height,
  }));

  const { error: mediaError } = await supabase
    .from("post_media")
    .insert(mediaRows);

  if (mediaError) {
    console.error("[updateAnimalPost] media", mediaError.message);
  }

  revalidatePath("/studio");
  revalidatePath(`/studio/post/${postId}`);
  revalidatePath(`/post/${postId}`);
  revalidatePath("/explore");
  return { ok: true, data: { id: postId } };
}
