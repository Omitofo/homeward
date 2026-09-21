import type { Role } from "@/types/domain";

export type AuthProfile = {
  id: string;
  email: string | null;
  role: Role;
  displayName: string;
  avatarUrl: string | null;
};

export type ActionResult<
  T = void,
> =
  | { ok: true; data: T }
  | { ok: false; error: string };
