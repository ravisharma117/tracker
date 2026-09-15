/**
 * The superscript reference marker a task leaves behind in its page's
 * content, in place of the line it was extracted from.
 *
 * Identical to api/netlify/lib/taskRef.ts — duplicated rather than shared,
 * same call this codebase already makes for the DTO shapes themselves (see
 * api/README.md's "cross-repo contract" section). Plain Unicode characters,
 * not HTML or custom Markdown syntax, so they survive Toast UI Editor's own
 * save/round-trip and the plain-text .md export/import untouched.
 */

const DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

export function markerFor(refNumber: number): string {
  return String(refNumber)
    .split("")
    .map((digit) => DIGITS[Number(digit)])
    .join("");
}

/** Matches any run of superscript digits — i.e. any marker markerFor() could have written. */
export const MARKER_PATTERN = /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g;

/** The reverse of markerFor — used when rendering to recover which task a marker points at. */
export function parseMarker(marker: string): number {
  return Number(
    marker
      .split("")
      .map((char) => DIGITS.indexOf(char))
      .join(""),
  );
}
