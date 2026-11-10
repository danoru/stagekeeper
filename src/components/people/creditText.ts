import type { CreditCategory } from "@prisma/client";

// Key order is display order on show and production pages.
export const CATEGORY_LABELS: Record<CreditCategory, string> = {
  CAST: "Cast",
  UNDERSTUDY: "Understudies and swings",
  CREATIVE: "Creative team",
  MUSICIAN: "Band",
  CREW: "Crew",
};

/** Cast and understudies name characters; everyone else has a job title. */
export function usesCharacter(category: CreditCategory): boolean {
  return category === "CAST" || category === "UNDERSTUDY";
}

/** "as Seymour", "for Seymour, Orin", "Swing", "Director", "Keys 1 (band)". */
export function describePart(part: {
  category: CreditCategory;
  role: string | null;
  character: string | null;
}): string {
  if (part.category === "CAST") return part.character ? `as ${part.character}` : "Cast";
  // Understudies list the parts they cover in `character`; a swing or standby has a role.
  if (part.category === "UNDERSTUDY") {
    // "Swing" or "Standby" typed as the part is a position, not a character covered.
    if (part.character && /^(swing|standby|understudy|alternate)s?$/i.test(part.character)) {
      return part.character;
    }
    if (part.character) return `for ${part.character}`;
    return part.role ?? "Swing";
  }
  if (part.role) return part.category === "MUSICIAN" ? `${part.role} (band)` : part.role;
  return CATEGORY_LABELS[part.category];
}
