"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PIN_COOKIE_NAME,
  PIN_MAX_AGE,
  createPinSession,
} from "@/lib/pinAuth";
import { checkPin } from "./counter";
import type { ActionState } from "./types";
export async function enterPin(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  let business: { id: string; pin_version: number };
  try {
    business = await checkPin(form.get("pin"));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Intenta nuevamente." };
  }
  (await cookies()).set(
    PIN_COOKIE_NAME,
    createPinSession(business.id, business.pin_version),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PIN_MAX_AGE,
    },
  );
  redirect("/pin");
}
export async function leavePin() {
  (await cookies()).delete(PIN_COOKIE_NAME);
  redirect("/pin");
}
