/**
 * Tiny className helper. Will be replaced by `clsx` + `tailwind-merge` later if needed.
 * For now keep zero extra deps.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
