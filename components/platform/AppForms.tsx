"use client";
import { useActionState, useEffect, useOptimistic, useState } from "react";
import { Heart, Printer, Star, Trash2 } from "lucide-react";
import {
  deleteOwnAccount,
  leaveFeedback,
  markNotificationsRead,
  toggleFavorite,
} from "@/lib/platform/app-actions";
import {
  removeBusinessMedia,
  saveHours,
  uploadBusinessMedia,
} from "@/lib/platform/business-actions";
import { sendAnnouncement } from "@/lib/platform/access-actions";
import { dayNames } from "@/lib/platform/hours";
import type { WeekHours } from "@/lib/platform/types";
import { Button } from "@/components/ui/button";
import { Feedback, Password } from "./Forms";

/** Heart toggle for a benefit or a business. Lights up before the server answers. */
export function FavoriteButton({
  kind,
  id,
  saved,
  name,
}: {
  kind: "benefit" | "business";
  id: string;
  saved: boolean;
  name: string;
}) {
  const [on, setOn] = useOptimistic(saved, (_: boolean, next: boolean) => next);
  return (
    <form
      action={async (form) => {
        setOn(form.get("saved") === "true");
        await toggleFavorite({}, form);
      }}
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="saved" value={String(!on)} />
      <button
        type="submit"
        className="rp-fav"
        aria-pressed={on}
        aria-label={(on ? "Quitar de favoritos: " : "Guardar en favoritos: ") + name}
      >
        <Heart aria-hidden="true" />
      </button>
    </form>
  );
}

/** After a use: stars, whether the benefit was applied, an optional note. */
export function FeedbackForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(leaveFeedback, {});
  const [rating, setRating] = useState(0);
  if (state.success)
    return (
      <p className="rp-success" role="status">
        {state.success}
      </p>
    );
  return (
    <form action={action} className="rp-form rp-feedback">
      <input type="hidden" name="id" value={id} />
      <fieldset className="rp-stars">
        <legend>¿Cómo te fue?</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input
              type="radio"
              name="rating"
              value={n}
              required
              onChange={() => setRating(n)}
            />
            <Star
              aria-hidden="true"
              className={n <= rating ? "on" : undefined}
            />
            <span className="sr-only">
              {n} {n === 1 ? "estrella" : "estrellas"}
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className="rp-choice">
        <legend>¿Te aplicaron el beneficio?</legend>
        <label>
          <input type="radio" name="applied" value="true" required />
          <span>Sí</span>
        </label>
        <label>
          <input type="radio" name="applied" value="false" />
          <span>No</span>
        </label>
      </fieldset>
      <div className="rp-field">
        <label htmlFor={"comment-" + id}>Comentario (opcional)</label>
        <textarea id={"comment-" + id} name="comment" maxLength={500} />
      </div>
      <Feedback state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}

export function MarkNotificationsRead() {
  useEffect(() => {
    void markNotificationsRead();
  }, []);
  return null;
}

export function DeleteAccountForm({ business }: { business: boolean }) {
  const [state, action, pending] = useActionState(deleteOwnAccount, {});
  return (
    <form
      action={action}
      className="rp-form"
      onSubmit={(e) => {
        if (!confirm("¿Eliminar tu cuenta para siempre?")) e.preventDefault();
      }}
    >
      <Password label="Tu contraseña" />
      <label className="rp-check">
        <input name="confirm" type="checkbox" required />
        <span>
          Entiendo que se borran mis datos personales y que no se puede
          deshacer.
          {business
            ? " El comercio seguirá en RidePerks hasta que el equipo lo pause."
            : " Si tienes una membresía activa, no se reembolsa."}
        </span>
      </label>
      <Feedback state={state} />
      <Button
        type="submit"
        variant="destructive"
        size="lg"
        disabled={pending}
        leftIcon={<Trash2 aria-hidden="true" />}
      >
        {pending ? "Eliminando…" : "Eliminar mi cuenta"}
      </Button>
    </form>
  );
}

export function PrintButton() {
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => window.print()}
      leftIcon={<Printer aria-hidden="true" />}
    >
      Descargar o imprimir
    </Button>
  );
}

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(sendAnnouncement, {});
  return (
    <form
      action={action}
      className="rp-form"
      key={state.success}
      onSubmit={(e) => {
        if (!confirm("¿Enviar este anuncio ahora? No se puede retirar."))
          e.preventDefault();
      }}
    >
      <div className="rp-field">
        <label htmlFor="audience">Para</label>
        <select id="audience" name="audience" defaultValue="drivers">
          <option value="drivers">Todos los conductores</option>
          <option value="businesses">Todos los comercios</option>
          <option value="all">Conductores y comercios</option>
        </select>
      </div>
      <div className="rp-field">
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required minLength={3} maxLength={140} />
      </div>
      <div className="rp-field">
        <label htmlFor="body">Mensaje</label>
        <textarea id="body" name="body" required minLength={3} maxLength={1000} />
      </div>
      <div className="rp-field">
        <label htmlFor="href">Enlace dentro de la app (opcional)</label>
        <input
          id="href"
          name="href"
          maxLength={200}
          placeholder="/driver/benefits"
          pattern="/[A-Za-z0-9/_?=&.%\-]*"
        />
      </div>
      <Feedback state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar anuncio"}
      </Button>
    </form>
  );
}

export function HoursForm({ hours }: { hours: WeekHours | null }) {
  const [state, action, pending] = useActionState(saveHours, {});
  // Monday first, as people read a week.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <form action={action} className="rp-form">
      <p className="rp-muted">
        Para abrir las 24 horas usa 00:00 a 00:00. Si cierras después de
        medianoche, pon la hora de cierre del día siguiente.
      </p>
      <div className="rp-hours-edit">
        {order.map((day) => {
          const value = hours?.[day] || null;
          return (
            <fieldset key={day}>
              <label className="rp-check">
                <input
                  type="checkbox"
                  name={"open_" + day}
                  defaultChecked={Boolean(value)}
                />
                <span>{dayNames[day]}</span>
              </label>
              <input
                type="time"
                name={"from_" + day}
                aria-label={dayNames[day] + ": abre"}
                defaultValue={value?.[0] || "08:00"}
              />
              <input
                type="time"
                name={"to_" + day}
                aria-label={dayNames[day] + ": cierra"}
                defaultValue={
                  value ? (value[1] === "24:00" ? "00:00" : value[1]) : "18:00"
                }
              />
            </fieldset>
          );
        })}
      </div>
      <Feedback state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Guardando…" : "Guardar horario"}
      </Button>
    </form>
  );
}

function UploadForm({ kind, label }: { kind: "logo" | "photo"; label: string }) {
  const [state, action, pending] = useActionState(uploadBusinessMedia, {});
  return (
    <form action={action} className="rp-form" key={state.success}>
      <input type="hidden" name="kind" value={kind} />
      <div className="rp-field">
        <label htmlFor={"media-" + kind}>{label}</label>
        <input
          id={"media-" + kind}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </div>
      <Feedback state={state} />
      <Button type="submit" variant="secondary" size="md" disabled={pending}>
        {pending ? "Subiendo…" : "Subir"}
      </Button>
    </form>
  );
}

function RemoveMedia({ path, label }: { path: string; label: string }) {
  const [state, action, pending] = useActionState(removeBusinessMedia, {});
  return (
    <form action={action}>
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        className="rp-media-remove"
        disabled={pending}
        aria-label={label}
      >
        <Trash2 aria-hidden="true" />
      </button>
      {state.error && <span className="sr-only">{state.error}</span>}
    </form>
  );
}

export function MediaForms({
  logo,
  photos,
}: {
  logo: { path: string; url: string } | null;
  photos: { path: string; url: string }[];
}) {
  return (
    <div className="rp-stack tight">
      <p className="rp-muted">
        JPG, PNG o WebP de hasta 2 MB. Se publican al instante para los
        conductores.
      </p>
      <h3>Logo</h3>
      {logo && (
        <div className="rp-media-grid">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.url} alt="Logo actual" />
            <RemoveMedia path={logo.path} label="Quitar logo" />
          </figure>
        </div>
      )}
      <UploadForm kind="logo" label={logo ? "Cambiar logo" : "Subir logo"} />
      <h3>Fotos ({photos.length} de 6)</h3>
      {photos.length > 0 && (
        <div className="rp-media-grid">
          {photos.map((photo, i) => (
            <figure key={photo.path}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={"Foto " + (i + 1)} />
              <RemoveMedia path={photo.path} label={"Quitar foto " + (i + 1)} />
            </figure>
          ))}
        </div>
      )}
      {photos.length < 6 && <UploadForm kind="photo" label="Agregar foto" />}
    </div>
  );
}
