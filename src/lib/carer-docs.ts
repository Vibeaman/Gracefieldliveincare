import type { DocumentStatus, DocumentType } from "@/lib/database.types";

export const DOCUMENT_TYPES: Array<{
  value: DocumentType;
  label: string;
  hint: string;
}> = [
  {
    value: "id",
    label: "Photo ID",
    hint: "A photo of your passport or driving licence.",
  },
  {
    value: "proof_of_address",
    label: "Proof of address",
    hint: "A recent bill or bank letter that shows your name and address.",
  },
  {
    value: "reference",
    label: "Reference letter",
    hint: "A short letter from someone who knows your care work.",
  },
  {
    value: "certificate",
    label: "Care certificate or training",
    hint: "If you have one. A photo or PDF is fine.",
  },
  {
    value: "dbs",
    label: "DBS check",
    hint: "Your criminal record check, if you already have one.",
  },
];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  uploaded: "Uploaded",
  reviewed: "Reviewed",
  verified: "Verified",
};

export const DOCUMENT_STATUS_ORDER: DocumentStatus[] = ["uploaded", "reviewed", "verified"];

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export const EXPERIENCE_LABELS: Record<string, string> = {
  none: "No experience yet",
  "under-1": "Less than 1 year",
  "1-3": "1 to 3 years",
  "3-5": "3 to 5 years",
  "5-plus": "More than 5 years",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  "full-time": "Full-time live-in",
  "part-time": "Part-time",
  unsure: "Not sure yet",
};

export function documentLabel(docType: string): string {
  return DOCUMENT_TYPES.find((item) => item.value === docType)?.label ?? docType;
}

export function experienceLabel(value: string): string {
  return EXPERIENCE_LABELS[value] ?? value;
}

export function availabilityLabel(value: string): string {
  return AVAILABILITY_LABELS[value] ?? value;
}

export function isAllowedDocument(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)) {
    return "Please upload a PDF, JPG or PNG.";
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return "Each file needs to be 10MB or smaller.";
  }
  if (file.type && !ALLOWED_DOCUMENT_TYPES.includes(file.type) && file.type !== "image/jpg") {
    return "Please upload a PDF, JPG or PNG.";
  }
  return null;
}
