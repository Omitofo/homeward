import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

export function ChevronLeft(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}
