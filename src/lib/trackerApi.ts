/**
 * Typed calls to /api/tracker-pages and /api/tracker-tasks.
 *
 * Every route here is password-gated, GET included — there is no public
 * consumer of this data. See api/README.md's "tracker endpoints" section.
 */

import { apiGetAuthed, apiSend } from "./api";

export type TrackerPage = {
  id: string;
  name: string;
  content: string;
  parent_id: string | null;
  child_count: number;
  task_count: number;
  open_task_count: number;
  created_at: string;
  updated_at: string;
};

export type TrackerPageAncestor = { id: string; name: string };

export type TrackerPageWithAncestors = TrackerPage & { ancestors: TrackerPageAncestor[] };

export type TrackerPageInput = { name: string; content: string; parent_id: string | null };

export type TrackerPageRevision = { id: string; content: string; created_at: string };

export type TrackerTask = {
  id: string;
  page_id: string;
  ref_number: number;
  content: string;
  done: boolean;
  created_at: string;
  updated_at: string;
};

export type TrackerExtractTaskResult = { task: TrackerTask; page: TrackerPage };

/** Verify a password without writing anything. Used by the lock screen. */
export async function checkPassword(password: string): Promise<boolean> {
  try {
    await apiSend<{ ok: true }>("POST", "/api/auth", password);
    return true;
  } catch {
    return false;
  }
}

/** parentId: a page id, or "root" for the top-level list. */
export function listPages(password: string, parentId: string): Promise<TrackerPage[]> {
  return apiGetAuthed<TrackerPage[]>("/api/tracker-pages", password, { parentId });
}

export function getPage(id: string, password: string): Promise<TrackerPageWithAncestors> {
  return apiGetAuthed<TrackerPageWithAncestors>(`/api/tracker-pages/${id}`, password);
}

export function createPage(input: TrackerPageInput, password: string): Promise<TrackerPage> {
  return apiSend<TrackerPage>("POST", "/api/tracker-pages", password, input);
}

export function updatePage(
  id: string,
  input: Pick<TrackerPageInput, "name" | "content">,
  password: string,
): Promise<TrackerPage> {
  return apiSend<TrackerPage>("PUT", `/api/tracker-pages/${id}`, password, input);
}

export function deletePage(
  id: string,
  password: string,
): Promise<{ deleted: true; pagesDeleted: number }> {
  return apiSend("DELETE", `/api/tracker-pages/${id}`, password);
}

export function listRevisions(pageId: string, password: string): Promise<TrackerPageRevision[]> {
  return apiGetAuthed<TrackerPageRevision[]>(`/api/tracker-pages/${pageId}/revisions`, password);
}

export function restoreRevision(
  pageId: string,
  revisionId: string,
  password: string,
): Promise<TrackerPage> {
  return apiSend<TrackerPage>(
    "POST",
    `/api/tracker-pages/${pageId}/revisions/${revisionId}/restore`,
    password,
  );
}

export function listTasks(pageId: string, password: string): Promise<TrackerTask[]> {
  return apiGetAuthed<TrackerTask[]>("/api/tracker-tasks", password, { pageId });
}

/**
 * Turn one line of a page's content into a task. `content` is the exact
 * current line, checked server-side before anything is written; `taskContent`
 * (optional) is what the task's content becomes if it should differ — the
 * importer uses this to strip a Markdown checkbox's "- [ ] " off the stored
 * task text while still matching the raw line. See trackerTask.service.ts.
 */
export function extractTask(
  pageId: string,
  lineIndex: number,
  content: string,
  password: string,
  taskContent?: string,
): Promise<TrackerExtractTaskResult> {
  return apiSend<TrackerExtractTaskResult>("POST", "/api/tracker-tasks", password, {
    page_id: pageId,
    line_index: lineIndex,
    content,
    task_content: taskContent,
  });
}

export function updateTaskContent(
  id: string,
  content: string,
  password: string,
): Promise<TrackerTask> {
  return apiSend<TrackerTask>("PUT", `/api/tracker-tasks/${id}`, password, { content });
}

export function toggleTask(id: string, password: string): Promise<TrackerTask> {
  return apiSend<TrackerTask>("PUT", `/api/tracker-tasks/${id}/toggle`, password);
}

export function deleteTask(id: string, password: string): Promise<{ deleted: true }> {
  return apiSend("DELETE", `/api/tracker-tasks/${id}`, password);
}
