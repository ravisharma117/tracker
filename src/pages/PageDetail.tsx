import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  ChevronRight,
  Download,
  FileText,
  History,
  ListPlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MarkdownEditor, { type MarkdownEditorHandle } from "@/components/MarkdownEditor";
import { taskRefComponents } from "@/components/TaskRefBadge";

import { useManageSession } from "@/lib/manageSession";
import { handleWriteError } from "@/lib/managePassword";
import { downloadMarkdown, pageFilename, serializePageMarkdown } from "@/lib/markdown";
import { MARKER_PATTERN } from "@/lib/taskRef";
import { remarkTaskRef, taskRefHandlers } from "@/lib/taskRefPlugin";
import {
  createPage,
  deletePage,
  deleteTask,
  extractTask,
  getPage,
  listPages,
  listRevisions,
  listTasks,
  restoreRevision,
  toggleTask,
  updatePage,
  updateTaskContent,
  type TrackerPage,
  type TrackerPageRevision,
  type TrackerPageWithAncestors,
  type TrackerTask,
} from "@/lib/trackerApi";

const isMarkerOnly = (line: string) => new RegExp(`^(?:${MARKER_PATTERN.source})$`).test(line.trim());

/**
 * React Router keeps the same PageDetailView instance mounted when only the
 * `:id` param changes (a well-known v6 gotcha) — this wrapper forces a fresh
 * mount per page id, so `mode`/editing state from the page you just left can
 * never leak onto the one you're navigating to.
 */
const PageDetail = () => {
  const { id } = useParams<{ id: string }>();
  return <PageDetailView key={id} />;
};

const PageDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { password, onLock } = useManageSession();
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const [page, setPage] = useState<TrackerPageWithAncestors | null>(null);
  const [children, setChildren] = useState<TrackerPage[]>([]);
  const [tasks, setTasks] = useState<TrackerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mode, setMode] = useState<"view" | "edit">(searchParams.get("edit") === "1" ? "edit" : "view");
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<TrackerPageRevision[] | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState("");

  const load = () => {
    if (!id) return Promise.resolve();
    return Promise.all([getPage(id, password), listPages(password, id), listTasks(id, password)]).then(
      ([pageData, childData, taskData]) => {
        setPage(pageData);
        setEditName(pageData.name);
        setChildren(childData);
        setTasks(taskData);
      },
    );
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    load()
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof Error && error.message === "Page not found") setNotFound(true);
        else handleWriteError(error, onLock);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!page || !id || notFound) {
    return (
      <Card className="max-w-xl">
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">This page no longer exists.</p>
          <Button variant="outline" asChild>
            <Link to="/pages">Back to Pages</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const enterEdit = () => {
    setEditName(page.name);
    setMode("edit");
  };

  const cancelEdit = () => {
    setMode("view");
    if (searchParams.get("edit")) {
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const onSave = async () => {
    const content = editorRef.current?.getMarkdown() ?? page.content;
    setIsSaving(true);
    try {
      await updatePage(id, { name: editName.trim() || "Untitled", content }, password);
      await load();
      setMode("view");
      if (searchParams.get("edit")) {
        searchParams.delete("edit");
        setSearchParams(searchParams, { replace: true });
      }
      toast.success("Saved");
    } catch (error) {
      handleWriteError(error, onLock);
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePage(id, password);
      toast.success("Page deleted");
      navigate(page.parent_id ? `/pages/${page.parent_id}` : "/pages");
    } catch (error) {
      handleWriteError(error, onLock);
      setIsDeleting(false);
    }
  };

  const onNewSubPage = async () => {
    try {
      const child = await createPage({ name: "Untitled", content: "", parent_id: id }, password);
      navigate(`/pages/${child.id}?edit=1`);
    } catch (error) {
      handleWriteError(error, onLock);
    }
  };

  const onExport = () => {
    downloadMarkdown(pageFilename(page.name), serializePageMarkdown(page));
  };

  const onExtractLine = async (lineIndex: number, lineText: string) => {
    try {
      const result = await extractTask(id, lineIndex, lineText, password);
      setPage((prev) => (prev ? { ...prev, content: result.page.content } : prev));
      setTasks((prev) => [...prev, result.task]);
      toast.success(`Extracted as task ${result.task.ref_number}`);
    } catch (error) {
      handleWriteError(error, onLock);
    }
  };

  const onToggleTask = async (task: TrackerTask) => {
    try {
      const updated = await toggleTask(task.id, password);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (error) {
      handleWriteError(error, onLock);
    }
  };

  const onDeleteTask = async (task: TrackerTask) => {
    try {
      await deleteTask(task.id, password);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      await load();
    } catch (error) {
      handleWriteError(error, onLock);
    }
  };

  const onSaveTaskEdit = async (task: TrackerTask) => {
    const value = editingTaskValue.trim();
    if (!value) return;
    try {
      const updated = await updateTaskContent(task.id, value, password);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTaskId(null);
    } catch (error) {
      handleWriteError(error, onLock);
    }
  };

  const openHistory = () => {
    setHistoryOpen(true);
    if (revisions === null) {
      listRevisions(id, password)
        .then(setRevisions)
        .catch((error) => handleWriteError(error, onLock));
    }
  };

  const onRestore = async (revisionId: string) => {
    setIsRestoring(revisionId);
    try {
      await restoreRevision(id, revisionId, password);
      setRevisions(null);
      await load();
      toast.success("Restored");
      setHistoryOpen(false);
    } catch (error) {
      handleWriteError(error, onLock);
    } finally {
      setIsRestoring(null);
    }
  };

  const lines = page.content.split("\n");

  return (
    <div className="max-w-3xl">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/pages" className="hover:text-foreground">
          Pages
        </Link>
        {page.ancestors.map((ancestor) => (
          <span key={ancestor.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/pages/${ancestor.id}`} className="hover:text-foreground">
              {ancestor.name}
            </Link>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{page.name}</span>
        </span>
      </nav>

      {mode === "view" ? (
        <>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{page.name}</h1>

            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={openHistory}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export .md
              </Button>
              <Button variant="outline" size="sm" onClick={enterEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this page?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes "{page.name}", every sub-page inside it, and all of their tasks
                      and history. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {page.content.trim() && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="mb-3 text-xs text-muted-foreground">
                  Hover a line to extract it as a task.
                </p>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {lines.map((line, index) => {
                    if (line.trim() === "") return <div key={index} className="h-3" />;

                    return (
                      <div
                        key={index}
                        className="group relative -mx-2 rounded px-2 hover:bg-muted/50"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkTaskRef]}
                          // react-markdown's types don't know about the custom
                          // "taskRef"/"task-ref" node this file adds — see
                          // taskRefPlugin.ts's header comment for why that's
                          // an accepted gap rather than a real type error.
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          remarkRehypeOptions={{ handlers: taskRefHandlers } as any}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          components={taskRefComponents(tasks) as any}
                        >
                          {line}
                        </ReactMarkdown>
                        {!isMarkerOnly(line) && (
                          <button
                            type="button"
                            onClick={() => onExtractLine(index, line)}
                            className="absolute right-1 top-1 hidden items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-xs text-muted-foreground shadow-sm hover:text-foreground group-hover:flex"
                          >
                            <ListPlus className="h-3 w-3" />
                            Extract Task
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sub-pages</h2>
              <Button size="sm" variant="outline" onClick={onNewSubPage}>
                <Plus className="mr-2 h-4 w-4" />
                New sub-page
              </Button>
            </div>

            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {children.map((child) => (
                  <Link key={child.id} to={`/pages/${child.id}`}>
                    <Card className="transition-shadow hover:shadow-sm">
                      <CardContent className="flex items-center gap-2 py-3">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{child.name}</span>
                        {child.task_count > 0 && (
                          <Badge variant="outline" className="ml-auto shrink-0">
                            {child.open_task_count}/{child.task_count}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">To-Do List</h2>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks extracted yet — hover a line above and choose "Extract Task".
              </p>
            ) : (
              <ul className="divide-y rounded-md border">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        task.done ? "border-primary bg-primary" : "border-input"
                      }`}
                      aria-label={task.done ? "Mark open" : "Mark done"}
                    >
                      {task.done && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-primary-foreground">
                          <path d="M4.5 8.5 2 6l-1 1 3.5 3.5L11 3.5 10 2.5z" />
                        </svg>
                      )}
                    </button>

                    <Badge variant="outline" className="shrink-0">
                      {task.ref_number}
                    </Badge>

                    {editingTaskId === task.id ? (
                      <>
                        <Input
                          value={editingTaskValue}
                          onChange={(e) => setEditingTaskValue(e.target.value)}
                          className="h-8 flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => onSaveTaskEdit(task)}>
                          Save
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingTaskId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span
                          className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : ""}`}
                        >
                          {task.content}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditingTaskValue(task.content);
                          }}
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteTask(task)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Page name"
              className="text-lg font-semibold"
              autoFocus
            />
            <MarkdownEditor key={page.id + page.updated_at} ref={editorRef} initialValue={page.content} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>

          {revisions === null ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : revisions.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No earlier versions yet — history is recorded the next time this page's content changes.
            </p>
          ) : (
            <ul className="divide-y">
              {revisions.map((revision) => (
                <li key={revision.id} className="py-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(revision.created_at).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRestore(revision.id)}
                      disabled={isRestoring !== null}
                    >
                      {isRestoring === revision.id && (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      )}
                      Restore
                    </Button>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                    {revision.content || "(empty)"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageDetail;
