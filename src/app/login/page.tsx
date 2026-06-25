"use client";

import { useActionState } from "react";
import { entrar } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(entrar, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form action={action} className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Entregas GRS</h1>
          <p className="text-sm text-muted-foreground">
            Digite a senha para acessar os carrosséis
          </p>
        </div>

        <Input
          name="senha"
          type="password"
          placeholder="Senha"
          autoFocus
          required
          autoComplete="current-password"
        />

        {state?.error && (
          <p className="text-sm text-destructive text-center">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
