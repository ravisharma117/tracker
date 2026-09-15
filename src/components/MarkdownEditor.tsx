import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

/**
 * A thin wrapper around Toast UI Editor's vanilla core.
 *
 * Deliberately not @toast-ui/react-editor: that wrapper's latest release
 * (3.2.3) still peer-depends on "react": "^17.0.1" and hasn't shipped a real
 * update since ~2022, which fights this project's React 18 on plain
 * `npm install`. The core package has no peer dependencies at all — it's
 * framework-agnostic — so it's wrapped here instead, the standard move when
 * a library's official React binding has fallen behind the library itself.
 *
 * Uncontrolled by design: `initialValue` only seeds the editor on mount.
 * Render this with `key={page.id}` (or similar) wherever the underlying
 * content can change out from under it, so switching pages remounts a fresh
 * editor instead of trying to reconcile someone else's document into it.
 */
export type MarkdownEditorHandle = {
  getMarkdown: () => string;
};

type MarkdownEditorProps = {
  initialValue: string;
  height?: string;
};

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  ({ initialValue, height = "480px" }, ref) => {
    const elRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Editor | null>(null);

    useEffect(() => {
      if (!elRef.current) return;

      const editor = new Editor({
        el: elRef.current,
        initialValue,
        height,
        previewStyle: "tab",
        initialEditType: "wysiwyg",
        usageStatistics: false,
      });
      editorRef.current = editor;

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
      // Mount-only: this component is meant to be remounted (via a `key`) when
      // the caller wants a different document loaded, not diffed in place.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => editorRef.current?.getMarkdown() ?? "",
    }));

    return <div ref={elRef} />;
  },
);
MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
