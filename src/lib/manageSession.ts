/**
 * The contract between the manage layout and the pages inside it.
 *
 * Separate from ManageLayout.tsx so that file exports only its component, which is
 * what lets fast refresh work on it during development.
 */

import { useOutletContext } from "react-router-dom";

export type ManageSession = {
  password: string;
  /** Forget the password and return to the lock screen. */
  onLock: () => void;
};

/**
 * The session for the manage page rendered inside the layout.
 *
 * Safe to call unconditionally: the layout does not render its `Outlet` until a
 * password exists, so a page can never mount without one.
 */
export const useManageSession = (): ManageSession =>
  useOutletContext<ManageSession>();
