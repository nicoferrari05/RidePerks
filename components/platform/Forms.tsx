"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import {
  login,
  signup,
  recover,
  changePassword,
} from "@/lib/platform/auth-actions";
import { saveProfile, uploadVerification } from "@/lib/platform/driver-actions";
import {
  platforms,
  type Profile,
  type ActionState,
} from "@/lib/platform/types";
export function Feedback({ state }: { state: ActionState }) {
  return (
    <>
      {state.error && (
        <p className="rp-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rp-success" role="status">
          {state.success}
        </p>
      )}
    </>
  );
}
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = true,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="rp-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={type === "email" ? 254 : 100}
        inputMode={
          type === "tel" ? "tel" : type === "email" ? "email" : undefined
        }
      />
    </div>
  );
}
export function Password({
  name = "password",
  label = "Contraseña",
  newPassword = false,
}: {
  name?: string;
  label?: string;
  newPassword?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="rp-field">
      <label htmlFor={name}>{label}</label>
      <div className="rp-password">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          autoComplete={newPassword ? "new-password" : "current-password"}
          minLength={newPassword ? 10 : undefined}
          maxLength={128}
        />
        <button
          type="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {newPassword && <p className="rp-muted">Al menos 10 caracteres.</p>}
    </div>
  );
}
export function PlatformField({ value }: { value?: string }) {
  return (
    <div className="rp-field">
      <label htmlFor="platform">¿En qué plataforma trabajas?</label>
      <select id="platform" name="platform" defaultValue={value || ""} required>
        <option value="" disabled>
          Selecciona tu plataforma
        </option>
        {Object.entries(platforms).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
export function AuthForm({
  mode,
  next = "/driver/dashboard",
}: {
  mode: "login" | "register" | "recover";
  next?: string;
}) {
  const action =
    mode === "login" ? login : mode === "register" ? signup : recover;
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="rp-form">
      <input type="hidden" name="next" value={next} />
      {mode === "register" && (
        <Field label="Nombre completo" name="full_name" autoComplete="name" />
      )}
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
      />
      {mode !== "recover" && <Password newPassword={mode === "register"} />}
      {mode === "register" && (
        <>
          <Field
            label="WhatsApp (con código de país)"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+507 6000 0000"
          />
          <PlatformField />
          <label className="rp-check">
            <input name="terms" type="checkbox" required />
            <span>
              Acepto los{" "}
              <Link href="/terminos" target="_blank">
                términos de uso
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" target="_blank">
                política de privacidad
              </Link>
              .
            </span>
          </label>
        </>
      )}
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending
          ? "Un momento…"
          : mode === "login"
            ? "Iniciar sesión"
            : mode === "register"
              ? "Crear mi cuenta gratis"
              : "Enviar enlace"}
        {!pending && <ArrowRight size={18} aria-hidden="true" />}
      </button>
      {mode === "login" && (
        <Link href="/recover" className="rp-text-link">
          Olvidé mi contraseña
        </Link>
      )}
    </form>
  );
}
export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  return (
    <form action={action} className="rp-form">
      <Field
        label="Nombre completo"
        name="full_name"
        autoComplete="name"
        defaultValue={profile.full_name}
      />
      <Field
        label="WhatsApp (con código de país)"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={profile.phone || ""}
      />
      <PlatformField value={profile.platform || ""} />
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
export function VerificationForm() {
  const [state, action, pending] = useActionState(uploadVerification, {});
  return (
    <form action={action} className="rp-form">
      <div className="rp-field">
        <label htmlFor="photo">Captura de tu perfil de conductor</label>
        <input
          id="photo"
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-describedby="photo-help"
        />
        <p id="photo-help" className="rp-muted">
          JPG, PNG o WebP. Máximo 5 MB. No incluyas cédula, datos de pasajeros
          ni información de pagos.
        </p>
      </div>
      <Feedback state={state} />
      <button
        className="rp-button"
        disabled={pending || Boolean(state.success)}
      >
        {pending ? "Enviando imagen…" : "Enviar para revisión"}
      </button>
    </form>
  );
}
export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className="rp-form">
      <Password newPassword label="Nueva contraseña" />
      <Password newPassword name="confirmation" label="Repite la contraseña" />
      <Feedback state={state} />
      <button className="rp-button" disabled={pending}>
        {pending ? "Guardando…" : "Actualizar contraseña"}
      </button>
    </form>
  );
}
