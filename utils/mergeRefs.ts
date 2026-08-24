import type { Ref, RefCallback } from "react";

/** Combines several refs onto one element — needed wherever two independent
 * hooks (e.g. `useScrollReveal` + `useMagneticHover`) each want their own ref
 * on the same node, since a JSX `ref` prop only accepts one. */
export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}
