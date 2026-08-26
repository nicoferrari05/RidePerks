import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui className helper: merges conditional classNames and
// resolves conflicting Tailwind utilities (e.g. "px-2 px-4" -> "px-4").
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
