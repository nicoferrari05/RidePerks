import Image from "next/image";
import { cn } from "@/lib/utils";

// A real app screenshot (already includes the status bar and Dynamic
// Island) inside a thin black bezel. Screenshots are 1170 x 2532.
export default function PhoneFrame({
  src,
  alt,
  sizes = "(min-width: 1024px) 300px, 72vw",
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[2.6rem] bg-[#100b00] p-[7px] shadow-[0_40px_80px_-32px_rgba(16,11,0,0.55),0_0_0_1px_rgba(16,11,0,0.9)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1170}
        height={2532}
        sizes={sizes}
        priority={priority}
        className="block h-auto w-full rounded-[2.15rem] bg-white"
      />
    </div>
  );
}
