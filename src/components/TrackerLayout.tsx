import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FileText, Lock, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ManagePasswordGate } from "@/components/ManagePasswordGate";
import { clearPassword, readPassword, storePassword } from "@/lib/managePassword";
import type { ManageSession } from "@/lib/manageSession";
import { cn } from "@/lib/utils";

const sections = [
  { to: "/pages", label: "Pages", icon: FileText },
  { to: "/import", label: "Import", icon: Upload },
];

const titleFor = (pathname: string): string => {
  const section = sections.find(({ to }) => pathname.startsWith(to));
  return section ? section.label : "Tracker";
};

/**
 * The gate and shared chrome for every tracker page. Same shape as
 * admin.naxits' ManageLayout — applied as a parent route so the password is
 * unlocked once for the whole app, and a bookmark to a deep page lands on that
 * page rather than always redirecting to the list.
 */
const TrackerLayout = () => {
  const location = useLocation();
  const [password, setPassword] = useState<string | null>(() => readPassword());

  if (!password) {
    return (
      <ManagePasswordGate
        title={titleFor(location.pathname)}
        onUnlock={(value) => {
          storePassword(value);
          setPassword(value);
        }}
      />
    );
  }

  const session: ManageSession = {
    password,
    onLock: () => {
      clearPassword();
      setPassword(null);
    },
  };

  return (
    <div className="flex h-screen flex-col px-4 py-4 animate-slide-in md:px-8">
      <div className="mb-4 shrink-0 border-b pb-4">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <Link to="/pages" className="text-lg font-semibold">
            Tracker
          </Link>
          <Button variant="outline" size="sm" onClick={session.onLock}>
            <Lock className="mr-2 h-4 w-4" />
            Lock
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-3 md:mt-0">
          <Link
            to="/pages"
            className="mr-1 hidden text-lg font-semibold md:inline"
          >
            Tracker
          </Link>

          <nav className="-mx-4 flex flex-1 items-center gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
            {sections.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={false}>
                {({ isActive }) => (
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <Button
            variant="outline"
            size="sm"
            onClick={session.onLock}
            className="hidden shrink-0 md:inline-flex"
          >
            <Lock className="mr-2 h-4 w-4" />
            Lock
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet context={session} />
      </div>
    </div>
  );
};

export default TrackerLayout;
