// Autenticação simples por senha única — sem banco, sem usuários.
// A senha pode ser trocada pela env SITE_PASSWORD (senão usa o padrão abaixo).
// Constantes edge-safe (não importam next/headers), usadas no proxy.ts.

export const SENHA = process.env.SITE_PASSWORD ?? "Sucesso@2026";
export const COOKIE_NAME = "entregas_auth";
export const COOKIE_VALUE = "ok";
