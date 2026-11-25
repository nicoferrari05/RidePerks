import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import SiteFooter from "./SiteFooter";
import SiteNav from "./SiteNav";
import "./site.css";

// Closest Google face to the RidePerks wordmark: wide, round, geometric.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

// Frame of every public page: font, styles, header, footer and the scroll
// reveals. Pages put their sections inside <main>.
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={cn("rpx min-h-[100dvh]", jakarta.variable)}>
      <Reveal />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
