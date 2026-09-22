import type { VerificationRequest } from "./schema";
import type { VerificationStatus } from "@/types/domain";

const requests: VerificationRequest[] = [];
/** shelterId → status override for mock getShelterForProfile */
const statusByShelter = new Map<string, VerificationStatus>();

export function addMockVerificationRequest(req: VerificationRequest): void {
  requests.unshift(req);
  statusByShelter.set(req.shelterId, "pending");
}

export function listMockVerificationByShelter(
  shelterId: string,
): VerificationRequest[] {
  return requests.filter((r) => r.shelterId === shelterId);
}

export function listAllMockVerificationRequests(): VerificationRequest[] {
  return requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMockVerificationRequest(
  id: string,
): VerificationRequest | null {
  return requests.find((r) => r.id === id) ?? null;
}

export function updateMockVerificationRequest(
  id: string,
  patch: Partial<VerificationRequest>,
): VerificationRequest | null {
  const idx = requests.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const next = { ...requests[idx], ...patch };
  requests[idx] = next;
  return next;
}

export function getMockVerificationStatus(
  shelterId: string,
): VerificationStatus | null {
  return statusByShelter.get(shelterId) ?? null;
}

export function setMockVerificationStatus(
  shelterId: string,
  status: VerificationStatus,
): void {
  statusByShelter.set(shelterId, status);
}
