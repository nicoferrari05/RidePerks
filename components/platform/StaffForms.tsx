"use client";
import { useActionState } from "react";
import {
  createStaffInvite,
  acceptStaffInvite,
  removeStaff,
} from "@/lib/platform/business-actions";
import { Feedback } from "./Forms";
export function StaffInvite() {
  const [state, action, pending] = useActionState(createStaffInvite, {});
  return (
    <form action={action} className="rp-form">
      <p className="rp-muted">
        Comparte este enlace con el empleado. Debe crear su propia cuenta de
        comercio y aceptar la invitación. Vence en 48 horas y solo puede usarse
        una vez.
      </p>
      <button className="rp-button" disabled={pending}>
        {pending ? "Creando…" : "Crear invitación para personal"}
      </button>
      {state.error && (
        <p role="alert" className="rp-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <label className="rp-field">
          Enlace de invitación
          <input
            aria-label="Enlace de invitación"
            readOnly
            value={
              typeof window === "undefined"
                ? state.success
                : window.location.origin + state.success
            }
            onFocus={(e) => e.target.select()}
          />
        </label>
      )}
    </form>
  );
}
export function AcceptInvite({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptStaffInvite, {});
  return (
    <form action={action} className="rp-form">
      <input type="hidden" name="invite" value={token} />
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending ? "Vinculando…" : "Aceptar acceso como personal"}
      </button>
    </form>
  );
}
export function RemoveStaff({ id }: { id: string }) {
  const [state, action, pending] = useActionState(removeStaff, {});
  return (
    <form action={action}>
      <input type="hidden" name="user_id" value={id} />
      <button className="rp-button secondary" disabled={pending}>
        Retirar acceso
      </button>
      <Feedback state={state} />
    </form>
  );
}
