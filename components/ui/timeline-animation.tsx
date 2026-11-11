"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import type { RefObject } from "react";

// Reveals its content once the shared timeline container scrolls into view;
// `animationNum` orders the children (the variants receive it as `custom`).
// With reduced motion it renders the content in place, without animating.
const tags = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  ul: motion.ul,
  h2: motion.h2,
  h3: motion.h3,
} as const;

const fallback: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  }),
};

export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
}: {
  as?: keyof typeof tags;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
}) {
  const inView = useInView(timelineRef, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();
  const Tag = tags[as];
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      custom={animationNum}
      variants={customVariants || fallback}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </Tag>
  );
}
