import { useRef } from "react";

export function useConstant(init) {
  const ref = useRef(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref.current;
}
