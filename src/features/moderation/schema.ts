import { z } from "zod";

export const REPORT_REASONS = [
  "spam",
  "harassment",
  "misleading",
  "scam",
  "inappropriate",
  "other",
] as const;

export const submitReportSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(400).optional(),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;

export const resolveReportSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["dismiss", "hide_comment", "archive_post"]),
  note: z.string().trim().max(1000).default(""),
});

export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

export type ReportStatus = "open" | "dismissed" | "actioned";

export type ReportRow = {
  id: string;
  reporterId: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  status: ReportStatus;
  resolutionNote: string;
  createdAt: string;
  resolvedAt: string | null;
};
