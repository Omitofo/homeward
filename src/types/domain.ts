/** Shared domain types used by UI and repositories. */

export type Role = "adopter" | "shelter" | "admin";

export type Species = "dog" | "cat" | "rabbit" | "bird" | "other";
export type Sex = "male" | "female" | "unknown";
export type AgeGroup = "baby" | "young" | "adult" | "senior";
export type Size = "small" | "medium" | "large" | "xl";
export type PostStatus = "available" | "reserved" | "adopted" | "archived";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type PostMedia = {
  id: string;
  url: string;
  altText: string;
  position: number;
  width: number;
  height: number;
};

export type ShelterSummary = {
  id: string;
  handle: string;
  orgName: string;
  avatarUrl: string | null;
  verificationStatus: VerificationStatus;
  city: string;
  region: string;
  countryCode: string;
};

export type Shelter = ShelterSummary & {
  bio: string;
  links: { label: string; url: string }[];
  animalCount: number;
};

export type AnimalPost = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  ageMonths: number;
  ageGroup: AgeGroup;
  size: Size;
  description: string;
  status: PostStatus;
  traits: string[];
  countryCode: string;
  region: string;
  city: string;
  likeCount: number;
  commentCount: number;
  createdAt: string; // ISO
  media: PostMedia[];
  shelter: ShelterSummary;
};

export type FeedFilters = {
  q?: string;
  species?: Species[];
  size?: Size[];
  ageGroup?: AgeGroup[];
  sex?: Sex[];
  status?: PostStatus[];
  countryCode?: string;
  region?: string;
  city?: string;
  verifiedOnly?: boolean;
  traits?: string[];
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
