/**
 * A remark plugin that turns every run of superscript digits (a task
 * reference marker — see taskRef.ts) into its own mdast node, so
 * react-markdown can render it as an interactive <TaskRefBadge> instead of
 * plain text.
 *
 * Uses mdast-util-find-and-replace — the same utility remark-gfm itself uses
 * internally for things like autolinks — rather than hand-rolling text-node
 * splitting. The custom "taskRef" node needs a matching remark-rehype
 * handler (taskRefHandlers below) to become a real element; without it,
 * remark-rehype has no idea how to convert an unknown node type.
 *
 * Wire both into ReactMarkdown like:
 *   <ReactMarkdown
 *     remarkPlugins={[remarkGfm, remarkTaskRef]}
 *     remarkRehypeOptions={{ handlers: taskRefHandlers }}
 *     components={{ "task-ref": TaskRefBadge }}
 *   >
 */

import { findAndReplace } from "mdast-util-find-and-replace";
import { MARKER_PATTERN } from "./taskRef";

// findAndReplace's types only allow replacing with the standard mdast phrasing
// nodes (Text, Link, Emphasis, ...), not a custom one like ours — the `any`
// cast is the accepted escape hatch for extending mdast with a node type its
// own upstream types were never going to know about.
export function remarkTaskRef() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    findAndReplace(tree, [
      [
        MARKER_PATTERN,
        ((match: string) => ({
          type: "taskRef",
          children: [{ type: "text", value: match }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any,
      ],
    ]);
  };
}

export const taskRefHandlers = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskRef(state: any, node: any) {
    return {
      type: "element",
      tagName: "task-ref",
      properties: {},
      children: state.all(node),
    };
  },
};
