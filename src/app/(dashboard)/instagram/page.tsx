import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Instagram, CheckCircle2, AlertCircle, Plus } from "lucide-react";

export default async function InstagramPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("instagram_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instagram</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas contas conectadas</p>
        </div>
        <Button asChild>
          <Link href="/api/instagram/auth">
            <Plus className="h-4 w-4 mr-2" />
            Conectar conta
          </Link>
        </Button>
      </div>

      {!accounts?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Instagram className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Nenhuma conta conectada</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-6">
              Conecte sua conta do Instagram Business para publicar automaticamente.
            </p>
            <Button asChild>
              <Link href="/api/instagram/auth">
                <Instagram className="h-4 w-4 mr-2" />
                Conectar Instagram
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">@{account.username}</CardTitle>
                  <p className="text-xs text-muted-foreground">ID: {account.ig_user_id}</p>
                </div>
                <div className="ml-auto">
                  {account.is_active ? (
                    <Badge className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Inativo
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
