import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { parseMarker } from "@/lib/taskRef";
import type { TrackerTask } from "@/lib/trackerApi";
import { cn } from "@/lib/utils";

/**
 * The interactive marker a task leaves in its page's content, rendered by
 * react-markdown wherever taskRefPlugin.ts found a superscript-digit run.
 * Hovering shows the task's current content — see taskRefPlugin.ts for how
 * the marker text reaches here as `children`.
 */
const TaskRefBadge = ({ children, tasks }: { children?: ReactNode; tasks: TrackerTask[] }) => {
  const number = parseMarker(String(children ?? ""));
  const task = tasks.find((t) => t.ref_number === number);

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <sup
          className={cn(
            "cursor-help rounded px-0.5 font-semibold",
            task
              ? task.done
                ? "text-muted-foreground line-through"
                : "text-primary"
              : "text-destructive",
          )}
        >
          {children}
        </sup>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {task ? task.content : "This task no longer exists."}
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Build react-markdown's `components` map for a given task list — a fresh
 * closure per render, so the badge always looks tasks up against the
 * current, just-fetched list rather than a stale one captured once.
 */
export function taskRefComponents(tasks: TrackerTask[]) {
  return {
    "task-ref": ({ children }: { children?: ReactNode }) => (
      <TaskRefBadge tasks={tasks}>{children}</TaskRefBadge>
    ),
  };
}

export default TaskRefBadge;
