"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "@/lib/utils";

// shadcn-style progress bar on Base UI (the project's primitive library,
// already used by Button) instead of Radix. Colors come from the page's
// --primary / --secondary tokens unless overridden with className.
function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}: Omit<ProgressPrimitive.Root.Props, "value"> & {
  value: number;
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root value={value} {...props}>
      <ProgressPrimitive.Track
        className={cn(
          "relative block h-2 w-full overflow-hidden rounded-full bg-secondary",
          className,
        )}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "block h-full rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            indicatorClassName,
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
