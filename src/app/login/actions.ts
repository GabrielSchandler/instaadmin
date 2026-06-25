"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SENHA, COOKIE_NAME, COOKIE_VALUE } from "@/lib/auth";

export async function entrar(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const senha = String(formData.get("senha") ?? "");
  if (senha !== SENHA) {
    return { error: "Senha incorreta." };
  }

  const store = await cookies();
  store.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  redirect("/");
}

export async function sair() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/login");
}
