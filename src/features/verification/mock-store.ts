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
