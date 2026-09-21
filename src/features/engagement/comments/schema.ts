import { z } from "zod";

export const commentBodySchema = z
  .string()
  .trim()
  .min(1, "Write something first")
  .max(1000, "Comments must be 1000 characters or fewer");

export const addCommentSchema = z.object({
  postId: z.string().min(1).max(80),
  body: commentBodySchema,
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
