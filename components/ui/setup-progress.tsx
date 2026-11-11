import Link from "next/link";
import { ChevronRight, CircleCheck, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// Account setup checklist (adapted from the c-progress-7 pattern). Server
// component: the steps and their state come from the page. The first open
// step is the one to do next and carries the action.
export type SetupStep = {
  label: string;
  completed: boolean;
  /** Short status under the label, e.g. "En revisión". */
  note?: string;
  href?: string;
  action?: string;
};

export default function SetupProgress({
  title = "Configura tu cuenta",
  steps,
  className,
}: {
  title?: string;
  steps: SetupStep[];
  className?: string;
}) {
  const completed = steps.filter((s) => s.completed).length;
  const next = steps.find((s) => !s.completed);
  return (
    <section className={cn("rp-setup", className)} aria-label={title}>
      <div className="rp-setup-head">
        <h2>{title}</h2>
        <span>
          {completed} de {steps.length} pasos
        </span>
      </div>
      <Progress
        value={(completed / steps.length) * 100}
        aria-label={title}
        aria-valuetext={completed + " de " + steps.length + " pasos"}
        className="rp-setup-track"
        indicatorClassName="rp-setup-bar"
      />
      <ol className="rp-setup-steps">
        {steps.map((step) => {
          const current = step === next;
          const body = (
            <>
              {step.completed ? (
                <CircleCheck className="rp-setup-done" aria-hidden="true" />
              ) : (
                <Circle aria-hidden="true" />
              )}
              <span className="rp-setup-label">
                {step.label}
                {step.completed && <span className="sr-only"> (listo)</span>}
                {step.note && <small>{step.note}</small>}
              </span>
              {step.href && !step.completed && (
                <ChevronRight className="rp-setup-go" aria-hidden="true" />
              )}
            </>
          );
          return (
            <li
              key={step.label}
              data-state={
                step.completed ? "done" : current ? "current" : "todo"
              }
            >
              {step.href && !step.completed ? (
                <Link href={step.href}>{body}</Link>
              ) : (
                <div>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
      {next?.href && next.action && (
        <Link
          href={next.href}
          className={buttonVariants({ variant: "default", size: "lg" })}
        >
          {next.action}
        </Link>
      )}
    </section>
  );
}
