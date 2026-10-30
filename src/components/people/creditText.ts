import type { CreditCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<CreditCategory, string> = {
  CAST: "Cast",
  CREATIVE: "Creative team",
  MUSICIAN: "Band",
  CREW: "Crew",
};

/** "as Seymour", "Director", "Keys 1 (band)". */
export function describePart(part: {
  category: CreditCategory;
  role: string | null;
  character: string | null;
}): string {
  if (part.category === "CAST") return part.character ? `as ${part.character}` : "Cast";
  if (part.role) return part.category === "MUSICIAN" ? `${part.role} (band)` : part.role;
  return CATEGORY_LABELS[part.category];
}
