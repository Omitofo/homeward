import { z } from "zod";

export const verificationDocSchema = z.object({
  path: z.string().min(1),
  fileName: z.string().min(1).max(200),
  mime: z.string().min(1),
  size: z.number().int().positive(),
});

export const verificationRequestSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(20, "Tell us a bit about your rescue (at least 20 characters)")
    .max(2000, "Notes must be 2000 characters or fewer"),
  documents: z
    .array(verificationDocSchema)
    .min(1, "Upload at least one supporting document")
    .max(5, "Maximum 5 documents"),
});

export type VerificationDocInput = z.infer<typeof verificationDocSchema>;
export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>;

export type VerificationRequestStatus =
  | "pending"
  | "needs_info"
  | "approved"
  | "rejected";

export type VerificationRequest = {
  id: string;
  shelterId: string;
  status: VerificationRequestStatus;
  notes: string;
  documents: VerificationDocInput[];
  reviewNote: string;
  createdAt: string;
  reviewedAt: string | null;
};
