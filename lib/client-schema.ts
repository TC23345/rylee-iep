import { z } from "zod";

// Client-safe schema for the v1 metadata-only client index. Do not add intake,
// contact, school, disability, document, or service fields here.

export const clientStatuses = ["prospective", "active", "paused", "archived"] as const;

export const clientIndexInputSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastInitial: z.string().trim().regex(/^[A-Za-z]$/, "Single letter only"),
  districtAbbr: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]+$/, "Abbreviation only — letters/numbers, no spaces"),
  status: z.enum(clientStatuses).default("prospective"),
});

export type ClientStatus = (typeof clientStatuses)[number];
export type ClientIndexInput = z.input<typeof clientIndexInputSchema>;
export type ClientIndexParsed = z.output<typeof clientIndexInputSchema>;

/** marcus-t-d214 — first-name(lowercased, hyphenated) + last initial + district abbr. */
export function deriveClientId(
  firstName: string,
  lastInitial: string,
  districtAbbr: string
): string {
  const first = firstName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${first}-${lastInitial.trim().toLowerCase()}-${districtAbbr.trim().toLowerCase()}`;
}

/** "Marcus T." — first name as entered + last initial + period. */
export function deriveDisplayName(firstName: string, lastInitial: string): string {
  return `${firstName.trim()} ${lastInitial.trim().toUpperCase()}.`;
}
