import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useManageSession } from "@/lib/manageSession";
import { handleWriteError } from "@/lib/managePassword";
import { CHECKBOX_LINE, parsePageMarkdown } from "@/lib/markdown";
import { createPage, extractTask, toggleTask } from "@/lib/trackerApi";

/**
 * Pick a .md file, review/edit the parsed name and content, save it as a
 * page, then auto-extract every GFM checkbox line into a task through the
 * same pipeline the hover "Extract Task" action uses — each checkbox becomes
 * a task and is replaced in the page's content by its reference marker.
 */
const ImportMarkdown = () => {
  const navigate = useNavigate();
  const { password, onLock } = useManageSession();

  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const onFile = async (file: File) => {
    const text = await file.text();
    setFileName(file.name);
    const parsed = parsePageMarkdown(text);
    setName(parsed.name);
    setContent(parsed.content);
  };

  const onImport = async () => {
    if (content === null) return;
    setIsImporting(true);

    try {
      const page = await createPage(
        { name: name.trim() || "Untitled", content, parent_id: null },
        password,
      );

      // Extraction targets a line index within the page's CURRENT content,
      // which only ever shrinks by replacement (never by line count) as each
      // checkbox is extracted — so the original indices stay valid across
      // the whole loop, run top to bottom.
      const lines = content.split("\n");
      let extracted = 0;

      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(CHECKBOX_LINE);
        if (!match) continue;

        const [, , mark, text] = match;
        try {
          const result = await extractTask(page.id, i, lines[i], password, text.trim());
          if (mark.toLowerCase() === "x") {
            await toggleTask(result.task.id, password);
          }
          extracted++;
        } catch (error) {
          // One bad line shouldn't sink the rest of the import.
          console.warn("Could not extract a checkbox line", error);
        }
      }

      toast.success(
        extracted > 0 ? `Imported "${page.name}" — extracted ${extracted} task${extracted === 1 ? "" : "s"}` : `Imported "${page.name}"`,
      );
      navigate(`/pages/${page.id}`);
    } catch (error) {
      handleWriteError(error, onLock);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Import Markdown</h1>
      <p className="mb-6 text-muted-foreground">
        A .md file with an "# Name" line — everything after it becomes the page's content
        verbatim, including a plain Notion page export. Any "- [ ]"/"- [x]" checkbox lines are
        automatically extracted into tasks, the same way hovering a line and choosing "Extract
        Task" does. Nothing is written until you click Import.
      </p>

      {content === null && (
        <Card>
          <CardContent className="pt-6">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed py-12 text-muted-foreground hover:bg-muted/50">
              <Upload className="h-6 w-6" />
              <span>Choose a .md file</span>
              <input
                type="file"
                accept=".md,text/markdown"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFile(file);
                }}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {content !== null && (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <p className="text-sm text-muted-foreground">
              Parsed from <strong>{fileName}</strong>.
            </p>

            <div className="space-y-2">
              <Label htmlFor="import-name">Name</Label>
              <Input id="import-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-content">Content</Label>
              <Textarea
                id="import-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContent(null);
                  setName("");
                  setFileName("");
                }}
                disabled={isImporting}
              >
                Choose a different file
              </Button>
              <Button onClick={onImport} disabled={isImporting}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportMarkdown;
