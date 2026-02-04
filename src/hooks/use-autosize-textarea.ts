import { type RefObject, useLayoutEffect } from "react";

type AutosizeOptions = {
  enabled?: boolean;
};

export function useAutosizeTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  options: AutosizeOptions = {},
) {
  const { enabled = true } = options;

  useLayoutEffect(() => {
    if (!enabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [enabled, textareaRef, value]);
}
