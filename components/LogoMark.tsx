import { cn } from "@/lib/utils";

// The RidePerks lockup (the "rp" mark beside the wordmark), used wherever the
// platform shows the brand. It is the PNG in public/brand used as a mask, so
// it takes the surrounding text colour (see .rp-lockup in app/globals.css).
// `variant` is kept for existing call sites; both variants render the lockup.

interface LogoMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "pill" | "text";
}

const heights = {
  sm: "h-[22px]",
  md: "h-7",
  lg: "h-9",
  xl: "h-12",
};

export default function LogoMark({ size = "md", className }: LogoMarkProps) {
  return (
    <span role="img" aria-label="RidePerks" className={cn("rp-lockup", heights[size], className)} />
  );
}
