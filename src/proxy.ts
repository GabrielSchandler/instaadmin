import { type NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, COOKIE_VALUE } from "@/lib/auth";

// Middleware do Next 16 — protege tudo com a senha (cookie). Sem Supabase.
export function proxy(request: NextRequest) {
  const autenticado =
    request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  const ehLogin = request.nextUrl.pathname === "/login";

  if (!autenticado && !ehLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (autenticado && ehLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // ignora estáticos e as imagens das entregas (servidas publicamente)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
