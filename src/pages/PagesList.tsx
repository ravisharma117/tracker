import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useManageSession } from "@/lib/manageSession";
import { handleWriteError } from "@/lib/managePassword";
import { createPage, listPages, type TrackerPage } from "@/lib/trackerApi";

/** The top level — root pages only. A page's own sub-pages live inside it. */
const PagesList = () => {
  const navigate = useNavigate();
  const { password, onLock } = useManageSession();

  const [pages, setPages] = useState<TrackerPage[] | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listPages(password, "root")
      .then((data) => {
        if (!cancelled) setPages(data);
      })
      .catch((error) => {
        if (!cancelled) handleWriteError(error, onLock);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const onNewPage = async () => {
    setIsCreating(true);
    try {
      const page = await createPage({ name: "Untitled", content: "", parent_id: null }, password);
      navigate(`/pages/${page.id}?edit=1`);
    } catch (error) {
      handleWriteError(error, onLock);
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">Everything you're keeping track of.</p>
        </div>
        <Button onClick={onNewPage} disabled={isCreating}>
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New page
        </Button>
      </div>

      {!pages && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}

      {pages && pages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No pages yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages?.map((page) => (
          <Link key={page.id} to={`/pages/${page.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <h2 className="truncate font-semibold leading-snug">{page.name}</h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {page.child_count > 0 && (
                    <Badge variant="outline">
                      {page.child_count} sub-page{page.child_count === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {page.task_count > 0 && (
                    <span>
                      {page.open_task_count}/{page.task_count} open
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PagesList;
