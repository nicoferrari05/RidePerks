"use client";
import { useActionState } from "react";
import { requestSupport, resolveSupport } from "@/lib/platform/support-actions";
import { Feedback } from "./Forms";
export default function SupportForm() {
  const [state, action, pending] = useActionState(requestSupport, {});
  return (
    <form action={action} className="rp-form">
      <div className="rp-field">
        <label htmlFor="topic">¿En qué podemos ayudarte?</label>
        <select name="topic" id="topic">
          <option value="benefit">Un beneficio o comercio</option>
          <option value="account">Mi cuenta o verificación</option>
          <option value="privacy">Acceso o corrección de mis datos</option>
          <option value="delete">Eliminar mi cuenta y datos</option>
        </select>
      </div>
      <div className="rp-field">
        <label htmlFor="message">Cuéntanos qué necesitas</label>
        <textarea
          name="message"
          id="message"
          required
          minLength={10}
          maxLength={2000}
        />
      </div>
      <p className="rp-muted">
        No incluyas contraseñas ni datos de pasajeros. Te contactaremos por el
        WhatsApp de tu perfil.
      </p>
      <Feedback state={state} />
      <button
        className="rp-button"
        disabled={pending || Boolean(state.success)}
      >
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
export function ResolveSupport({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resolveSupport, {});
  return (
    <form action={action}>
      <input name="id" type="hidden" value={id} />
      <button className="rp-button secondary" disabled={pending}>
        Marcar como atendida
      </button>
      <Feedback state={state} />
    </form>
  );
}
