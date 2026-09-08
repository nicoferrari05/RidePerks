"use client";
import { useActionState } from "react";
import {
  saveBusiness,
  saveBenefit,
  reviewVerification,
  toggleRecord,
  setDriverStatus,
} from "@/lib/platform/admin-actions";
import { Feedback } from "./Forms";
import { categories, type Business, type Benefit } from "@/lib/platform/types";
function Input({
  name,
  label,
  value = "",
  type = "text",
  required = true,
}: {
  name: string;
  label: string;
  value?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="rp-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        step={type === "number" ? "0.01" : undefined}
      />
    </div>
  );
}
function Textarea({
  name,
  label,
  value = "",
}: {
  name: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="rp-field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={value} required />
    </div>
  );
}
function Category({ value }: { value?: string }) {
  return (
    <div className="rp-field">
      <label htmlFor="category">Categoría</label>
      <select id="category" name="category" defaultValue={value || "otros"}>
        {Object.entries(categories).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
export function BusinessForm({ business: b }: { business?: Business }) {
  const [state, action, pending] = useActionState(saveBusiness, {});
  return (
    <form className="rp-form" action={action}>
      <input name="id" type="hidden" value={b?.id || ""} />
      <Input name="name" label="Nombre del comercio" value={b?.name} />
      <Textarea name="description" label="Descripción" value={b?.description} />
      <Category value={b?.category} />
      <Input name="address" label="Dirección en Panamá" value={b?.address} />
      <Input
        name="phone"
        label="Teléfono"
        type="tel"
        value={b?.phone || ""}
        required={false}
      />
      <Input
        name="owner_user_id"
        label="ID de la cuenta del comercio"
        value={b?.owner_user_id || ""}
        required={false}
      />
      <p className="rp-muted">
        El responsable debe registrarse primero. Copia su ID desde Conductores;
        al vincularlo tendrá acceso al portal de este comercio.
      </p>
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending ? "Guardando…" : "Guardar comercio"}
      </button>
    </form>
  );
}
export function BenefitForm({
  businesses,
  benefit: b,
}: {
  businesses: Pick<Business, "id" | "name">[];
  benefit?: Benefit;
}) {
  const [state, action, pending] = useActionState(saveBenefit, {});
  return (
    <form action={action} className="rp-form">
      <input name="id" type="hidden" value={b?.id || ""} />
      <div className="rp-field">
        <label htmlFor="business_id">Comercio aliado</label>
        <select
          id="business_id"
          name="business_id"
          defaultValue={b?.business_id || ""}
          required
        >
          <option value="" disabled>
            Selecciona el comercio
          </option>
          {businesses.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <Input name="title" label="Nombre del beneficio" value={b?.title} />
      <Input
        name="discount_label"
        label="Descuento acordado (ej. 10% en almuerzos)"
        value={b?.discount_label}
      />
      <Textarea name="description" label="Descripción" value={b?.description} />
      <Category value={b?.category} />
      <Textarea
        name="terms"
        label="Condiciones del beneficio"
        value={b?.terms}
      />
      <Input
        name="savings_amount"
        label="Ahorro fijo por uso (USD, opcional)"
        type="number"
        required={false}
        value={b?.savings_amount?.toString()}
      />
      <p className="rp-muted">
        Déjalo vacío para porcentajes o ahorros variables. Solo los montos fijos
        se suman al historial.
      </p>
      <Input
        name="monthly_limit"
        label="Máximo de usos al mes (opcional)"
        type="number"
        required={false}
        value={b?.monthly_limit?.toString()}
      />
      <Input
        name="valid_from"
        label="Disponible desde (opcional)"
        type="date"
        required={false}
        value={b?.valid_from || ""}
      />
      <Input
        name="valid_until"
        label="Disponible hasta (opcional)"
        type="date"
        required={false}
        value={b?.valid_until || ""}
      />
      <Feedback state={state} />
      <button className="rp-button" disabled={pending || !businesses.length}>
        {pending ? "Guardando…" : "Guardar beneficio"}
      </button>
    </form>
  );
}
export function ToggleForm({
  id,
  table,
  active,
}: {
  id: string;
  table: "rp_businesses" | "rp_benefits";
  active: boolean;
}) {
  const [state, action, pending] = useActionState(toggleRecord, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="active" value={String(!active)} />
      <button className="rp-button secondary" disabled={pending}>
        {pending ? "Guardando…" : active ? "Pausar" : "Activar"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
export function ReviewForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviewVerification, {});
  return (
    <form action={action} className="rp-form mt-4">
      <input type="hidden" name="id" value={id} />
      <div className="rp-field">
        <label htmlFor={"notes-" + id}>Mensaje para el conductor</label>
        <textarea id={"notes-" + id} name="notes" maxLength={1000} />
      </div>
      <Feedback state={state} />
      <div className="rp-actions">
        <button
          name="approved"
          value="true"
          className="rp-button"
          disabled={pending}
        >
          Aprobar verificación
        </button>
        <button
          name="approved"
          value="false"
          className="rp-button secondary"
          disabled={pending}
        >
          Solicitar corrección
        </button>
      </div>
    </form>
  );
}
export function DriverStatusForm({
  id,
  suspended,
}: {
  id: string;
  suspended: boolean;
}) {
  const [state, action, pending] = useActionState(setDriverStatus, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input
        type="hidden"
        name="status"
        value={suspended ? "pending" : "suspended"}
      />
      <button className="rp-button secondary" disabled={pending}>
        {suspended ? "Reactivar para revisión" : "Suspender cuenta"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
