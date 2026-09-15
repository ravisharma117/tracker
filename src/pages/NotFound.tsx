import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <p className="mb-6 text-muted-foreground">
          No page at <code>{location.pathname}</code>.
        </p>
        {/* Deliberately a router Link, not an anchor: this is a single-page app
            and a full reload here would drop the unlocked session. */}
        <Button asChild>
          <Link to="/pages">Back to Pages</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
