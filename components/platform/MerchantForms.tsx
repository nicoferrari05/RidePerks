"use client";
import { useActionState } from "react";
import {
  saveMerchantInfo,
  saveMerchantBenefit,
  toggleMerchantBenefit,
} from "@/lib/platform/business-actions";
import { categories, type Business } from "@/lib/platform/types";
import { Feedback } from "./Forms";
type Payload = {
  title?: string;
  description?: string;
  discount_label?: string;
  terms?: string;
  category?: string;
  savings_amount?: number | null;
  monthly_limit?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
};
export function MerchantInfo({
  business: b,
  pendingChange = false,
}: {
  business: Business;
  pendingChange?: boolean;
}) {
  const [state, action, pending] = useActionState(saveMerchantInfo, {});
  return (
    <form action={action} className="rp-form">
      <p className="rp-muted">
        Descripción y teléfono se actualizan al instante. Los cambios de nombre,
        dirección o categoría los revisa RidePerks antes de publicarlos.
      </p>
      {pendingChange && (
        <p className="rp-badge">Tienes un cambio pendiente de aprobación</p>
      )}
      <label className="rp-field">
        Nombre
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={b.name}
        />
      </label>
      <label className="rp-field">
        Descripción
        <textarea
          name="description"
          maxLength={2000}
          defaultValue={b.description}
        />
      </label>
      <label className="rp-field">
        Dirección
        <input
          name="address"
          required
          minLength={3}
          maxLength={250}
          defaultValue={b.address}
        />
      </label>
      <label className="rp-field">
        Teléfono
        <input
          name="phone"
          type="tel"
          maxLength={24}
          defaultValue={b.phone || ""}
        />
      </label>
      <label className="rp-field">
        Categoría
        <select name="category" defaultValue={b.category}>
          {Object.entries(categories).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending ? "Guardando…" : "Guardar información"}
      </button>
    </form>
  );
}
export function MerchantBenefitForm({
  payload = {},
  benefitId = "",
  revisionId = "",
}: {
  payload?: Payload;
  benefitId?: string;
  revisionId?: string;
}) {
  const [state, action, pending] = useActionState(saveMerchantBenefit, {});
  return (
    <form action={action} className="rp-form">
      <input type="hidden" name="benefit_id" value={benefitId} />
      <input
        type="hidden"
        name="revision_id"
        value={state.revisionId || revisionId}
      />
      <label className="rp-field">
        Nombre del beneficio
        <input
          name="title"
          required
          minLength={2}
          maxLength={140}
          defaultValue={payload.title}
        />
      </label>
      <label className="rp-field">
        Descuento o beneficio ofrecido
        <input
          name="discount_label"
          required
          minLength={2}
          maxLength={100}
          defaultValue={payload.discount_label}
        />
      </label>
      <label className="rp-field">
        Descripción
        <textarea
          name="description"
          required
          minLength={5}
          maxLength={3000}
          defaultValue={payload.description}
        />
      </label>
      <label className="rp-field">
        Categoría
        <select name="category" defaultValue={payload.category || "otros"}>
          {Object.entries(categories).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="rp-field">
        Términos, condiciones y restricciones
        <textarea
          name="terms"
          required
          minLength={5}
          maxLength={3000}
          defaultValue={payload.terms}
        />
      </label>
      <label className="rp-field">
        Ahorro fijo por uso, USD (opcional)
        <input
          name="savings_amount"
          type="number"
          min="0"
          max="999999"
          step="0.01"
          defaultValue={payload.savings_amount ?? ""}
        />
      </label>
      <p className="rp-muted">
        Déjalo vacío si el ahorro depende del consumo o es un porcentaje.
      </p>
      <label className="rp-field">
        Máximo de usos por conductor al mes (opcional)
        <input
          name="monthly_limit"
          type="number"
          min="1"
          max="1000"
          step="1"
          defaultValue={payload.monthly_limit ?? ""}
        />
      </label>
      <label className="rp-field">
        Disponible desde
        <input
          name="valid_from"
          type="date"
          defaultValue={payload.valid_from || ""}
        />
      </label>
      <label className="rp-field">
        Disponible hasta
        <input
          name="valid_until"
          type="date"
          defaultValue={payload.valid_until || ""}
        />
      </label>
      <Feedback state={state} />
      <div className="rp-actions">
        <button
          name="submit"
          value="draft"
          className="rp-button secondary"
          disabled={pending || state.submitted}
        >
          Guardar borrador
        </button>
        <button
          name="submit"
          value="review"
          className="rp-button"
          disabled={pending || state.submitted}
        >
          Enviar a aprobación
        </button>
      </div>
    </form>
  );
}
export function MerchantToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [state, action, pending] = useActionState(toggleMerchantBenefit, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!active)} />
      <button className="rp-button secondary" disabled={pending}>
        {active ? "Pausar beneficio" : "Activar beneficio aprobado"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
