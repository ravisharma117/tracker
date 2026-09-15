/**
 * Transport for the API.
 *
 * The endpoints live in a separate repo and deployment — naxits-api — backed by
 * MongoDB Atlas. They used to be Netlify Functions inside this repo under
 * netlify/functions; that directory is gone, and this site is now a pure static
 * bundle that talks to an API on another origin.
 *
 * Two consequences of that move:
 *
 *   1. VITE_API_BASE_URL is REQUIRED. It was optional when the API was
 *      same-origin and an empty value meant "same host"; now an empty value
 *      means every call hits this site's own SPA fallback and comes back as
 *      HTML. It is read at BUILD time, so it has to be set in Netlify's build
 *      environment, not just in a local .env.
 *   2. Every call is cross-origin, so the API's CORS_ALLOWED_ORIGINS must list
 *      this site's origins. An unlisted origin fails the preflight with 403
 *      before the handler runs.
 *
 * Errors still come back with real status codes plus an `{ error }` body — that
 * envelope is the contract unwrap() below depends on.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() || "";

// A missed build variable is otherwise a silent wall of 404s that look like a
// broken API rather than a misconfigured build.
if (import.meta.env.PROD && !API_BASE) {
  console.error(
    "VITE_API_BASE_URL is not set. This build has no API to talk to — set it in the Netlify build environment and redeploy.",
  );
}

/** Must match PASSWORD_HEADER in the API repo's netlify/lib/auth.ts. */
const PASSWORD_HEADER = "x-manage-password";

function url(path: string, params: Record<string, string> = {}): string {
  const query = new URLSearchParams(params).toString();
  return `${API_BASE}${path}${query ? `?${query}` : ""}`;
}

/**
 * Read the response, turning any failure into a thrown Error carrying the
 * server's message.
 *
 * A non-JSON body means we reached something other than the API — almost always
 * this site's own index.html, served by the SPA fallback because
 * VITE_API_BASE_URL was empty at build time and the request never left.
 */
async function unwrap<T>(response: Response): Promise<T> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "The API did not respond with JSON — is VITE_API_BASE_URL set for this build?"
        : `Request failed (${response.status})`,
    );
  }

  if (payload && typeof payload === "object" && "error" in payload) {
    throw new Error(String((payload as { error: unknown }).error));
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return payload as T;
}

export function apiGet<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  return fetch(url(path, params)).then(unwrap<T>);
}

/**
 * A privileged read.
 *
 * Licences are the main reason this exists: the rows carry activation keys and
 * customer contact details, so the API password-gates every method rather than
 * just the writes.
 *
 * Testimonials use it for one call only. Their *list* GET is public - it is what
 * the home page renders - but addressing one by id is something only the edit
 * form does, so that route is gated and this is how the form reads it.
 */
export function apiGetAuthed<T>(
  path: string,
  password: string,
  params: Record<string, string> = {},
): Promise<T> {
  return fetch(url(path, params), {
    headers: { [PASSWORD_HEADER]: password },
  }).then(unwrap<T>);
}

/** An unauthenticated POST. Used by the contact form, which has no password. */
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return fetch(url(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(unwrap<T>);
}

/** A privileged request. The password goes in a header; the body is JSON, or absent. */
export function apiSend<T>(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  password: string,
  body?: unknown,
): Promise<T> {
  return fetch(url(path), {
    method,
    headers: {
      [PASSWORD_HEADER]: password,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(unwrap<T>);
}
