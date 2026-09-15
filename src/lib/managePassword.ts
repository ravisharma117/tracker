/**
 * The manage pages' shared password, and what to do when the server rejects it.
 *
 * There is one password for the whole backend rather than accounts, so unlocking
 * either manage page unlocks both. It is held in sessionStorage: it survives a
 * reload but not the tab, and it never reaches localStorage where it would sit on
 * disk indefinitely.
 *
 * Replacing this with real sessions remains a worthwhile follow-up; keeping it in
 * one module is what will make that a single change rather than one per page.
 */

import { toast } from "sonner";

const PASSWORD_KEY = "nax_manage_password";

export function readPassword(): string | null {
  return sessionStorage.getItem(PASSWORD_KEY);
}

export function storePassword(password: string): void {
  sessionStorage.setItem(PASSWORD_KEY, password);
}

export function clearPassword(): void {
  sessionStorage.removeItem(PASSWORD_KEY);
}

/**
 * Report a failed write, and lock the page again if the password is the problem.
 *
 * The server answers exactly "unauthorized" for a bad password, which is the one
 * failure the user cannot fix by retrying — so it drops them back to the gate
 * instead of showing an error they can only stare at.
 */
export function handleWriteError(error: unknown, onLock: () => void): void {
  const message = error instanceof Error ? error.message : "Something went wrong";

  if (message === "unauthorized") {
    toast.error("Password rejected — please sign in again");
    onLock();
    return;
  }

  toast.error(message);
}
