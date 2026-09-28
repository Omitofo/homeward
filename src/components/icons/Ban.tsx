import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

/** Block user (Lucide ban). */
export function Ban(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" />
    </IconBase>
  );
}
