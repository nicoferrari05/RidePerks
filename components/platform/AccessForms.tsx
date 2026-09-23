"use client";
import { useActionState, useState } from "react";
import {
  enrollAdmin,
  manageAccess,
  reviewBenefit,
  reviewBusinessChange,
  creditPayment,
} from "@/lib/platform/access-actions";
import { Feedback } from "./Forms";
export function AdminIdentity() {
  const [state, action, pending] = useActionState(enrollAdmin, {});
  return (
    <form action={action} className="rp-form">
      <p className="rp-muted">
        Inicia sesión con tu cuenta personal de RidePerks en otra pestaña.
        Vincularla requiere además esta sesión administrativa. Los nuevos
        cambios quedarán atribuidos a esa cuenta.
      </p>
      <Feedback state={state} />
      <button className="rp-button secondary" disabled={pending}>
        Vincular mi identidad administrativa
      </button>
    </form>
  );
}
export function AccessForm({ driverId }: { driverId: string }) {
  const [state, action, pending] = useActionState(manageAccess, {});
  const [kind, setKind] = useState("trial"),
    [operation, setOperation] = useState("grant");
  return (
    <form className="rp-form" action={action}>
      <input name="driver_id" type="hidden" value={driverId} />
      <label className="rp-field">
        Acción
        <select
          name="action"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="grant">Otorgar o extender acceso</option>
          <option value="suspend">Suspender acceso</option>
          <option value="cancel">Cancelar acceso</option>
          <option value="resume">Retirar suspensión o cancelación</option>
        </select>
      </label>
      <label className="rp-field">
        Tipo de acceso
        <select
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="trial">Prueba gratuita</option>
          <option value="courtesy">Cortesía / promoción</option>
          <option value="extension">Extensión</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </label>
      <label
        className="rp-field"
        hidden={
          operation !== "grant" || kind === "lifetime" || kind === "extension"
        }
      >
        Válido hasta (fin del día en Panamá)
        <input name="end" type="date" />
      </label>
      <label
        className="rp-field"
        hidden={operation !== "grant" || kind !== "extension"}
      >
        Días adicionales
        <input name="days" type="number" min="0" max="3660" defaultValue="0" />
      </label>
      <label
        className="rp-field"
        hidden={operation !== "grant" || kind !== "extension"}
      >
        Meses adicionales
        <input name="months" type="number" min="0" max="120" defaultValue="0" />
      </label>
      <label className="rp-field">
        Motivo
        <textarea name="reason" required minLength={3} maxLength={1000} />
      </label>
      <p className="rp-muted">
        Suspender o cancelar bloquea los beneficios hasta que retires el
        bloqueo. No borra pagos, no devuelve dinero y no detiene el vencimiento
        del tiempo existente. Otorgar una cortesía no retira un bloqueo.
      </p>
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending ? "Guardando…" : "Aplicar cambio de acceso"}
      </button>
    </form>
  );
}
export function BenefitReview({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviewBenefit, {});
  return (
    <form action={action} className="rp-form">
      <input name="id" type="hidden" value={id} />
      <label className="rp-field">
        Observaciones
        <textarea name="notes" maxLength={1000} />
      </label>
      <Feedback state={state} />
      <div className="rp-actions">
        <button
          name="decision"
          value="approve"
          className="rp-button"
          disabled={pending}
        >
          Aprobar propuesta
        </button>
        <button
          name="decision"
          value="return"
          className="rp-button secondary"
          disabled={pending}
        >
          Devolver para corregir
        </button>
      </div>
    </form>
  );
}
export function BusinessChangeReview({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviewBusinessChange, {});
  return (
    <form action={action} className="rp-form">
      <input name="id" type="hidden" value={id} />
      <label className="rp-field">
        Observaciones
        <textarea name="notes" maxLength={1000} />
      </label>
      <Feedback state={state} />
      <div className="rp-actions">
        <button
          name="decision"
          value="approve"
          className="rp-button"
          disabled={pending}
        >
          Aprobar cambio
        </button>
        <button
          name="decision"
          value="return"
          className="rp-button secondary"
          disabled={pending}
        >
          Devolver
        </button>
      </div>
    </form>
  );
}
export function CreditPayment({ order }: { order: string }) {
  const [state, action, pending] = useActionState(creditPayment, {});
  return (
    <details>
      <summary className="rp-text-link">Acreditar manualmente →</summary>
      <form action={action} className="rp-form mt-3">
        <input name="order" type="hidden" value={order} />
        <label className="rp-field">
          Motivo (por ejemplo, comprobante de Yappy)
          <textarea name="reason" required minLength={3} maxLength={1000} />
        </label>
        <Feedback state={state} />
        <button className="rp-button secondary" disabled={pending}>
          {pending ? "Acreditando…" : "Confirmar acreditación"}
        </button>
      </form>
    </details>
  );
}
