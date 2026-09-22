import type { ReportRow } from "./schema";

const reports: ReportRow[] = [];
const hiddenComments = new Set<string>();
const archivedPosts = new Set<string>();

export function addMockReport(row: ReportRow): void {
  reports.unshift(row);
}

export function listMockOpenReports(): ReportRow[] {
  return reports.filter((r) => r.status === "open");
}

export function getMockReport(id: string): ReportRow | null {
  return reports.find((r) => r.id === id) ?? null;
}

export function updateMockReport(
  id: string,
  patch: Partial<ReportRow>,
): ReportRow | null {
  const idx = reports.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const current = reports[idx];
  if (!current) return null;
  const next: ReportRow = { ...current, ...patch };
  reports[idx] = next;
  return next;
}

export function hasOpenMockReport(
  reporterId: string,
  targetType: string,
  targetId: string,
): boolean {
  return reports.some(
    (r) =>
      r.status === "open" &&
      r.reporterId === reporterId &&
      r.targetType === targetType &&
      r.targetId === targetId,
  );
}

export function hideMockComment(id: string): void {
  hiddenComments.add(id);
}

export function isMockCommentHidden(id: string): boolean {
  return hiddenComments.has(id);
}

export function archiveMockPost(id: string): void {
  archivedPosts.add(id);
}

export function isMockPostArchived(id: string): boolean {
  return archivedPosts.has(id);
}
