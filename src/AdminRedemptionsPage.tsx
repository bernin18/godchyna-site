import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useAuthSession } from "./auth";
import { useLanguage } from "./i18n";
import { supabase } from "./supabase";
import "./admin-redemptions.css";

type RedemptionStatus = "pending" | "delivered" | "cancelled";

type RedemptionRow = {
  id: number;
  user_id: string;
  display_name: string | null;
  twitch_login: string | null;
  item_key: string | null;
  item_name: string;
  item_type: "skin" | "service" | "promo_code";
  item_image_path: string | null;
  chy_used: number | string;
  wp_used: number;
  status: RedemptionStatus;
  delivery_note: string | null;
  created_at: string;
  delivered_at: string | null;
  delivered_by: string | null;
};

type Filter = "all" | "pending" | "delivered";

const asset = (name: string) => `${import.meta.env.BASE_URL}${name.replace(/^\//, "")}`;

export default function AdminRedemptionsPage({
  Header,
  Footer,
}: {
  Header: React.ComponentType;
  Footer: React.ComponentType;
}) {
  const { pick } = useLanguage();
  const { user, loading: authLoading } = useAuthSession();
  const [rows, setRows] = useState<RedemptionRow[]>([]);
  const [access, setAccess] = useState<"loading" | "admin" | "denied">("loading");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccess("denied");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const roleResult = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle();

      if (cancelled) return;

      if (roleResult.error || roleResult.data?.role !== "admin") {
        setAccess("denied");
        setLoading(false);
        return;
      }

      setAccess("admin");

      const result = await supabase
        .from("store_redemptions")
        .select("id,user_id,display_name,twitch_login,item_key,item_name,item_type,item_image_path,chy_used,wp_used,status,delivery_note,created_at,delivered_at,delivered_by")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (result.error) {
        console.warn("Unable to load store redemptions", result.error);
        setError(pick("Não foi possível carregar os resgates.", "Unable to load redemptions."));
        setRows([]);
      } else {
        setRows((result.data ?? []) as RedemptionRow[]);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, pick]);

  const counts = useMemo(() => ({
    all: rows.length,
    pending: rows.filter(row => row.status === "pending").length,
    delivered: rows.filter(row => row.status === "delivered").length,
  }), [rows]);

  const visibleRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter(row => row.status === filter);
  }, [filter, rows]);

  async function markDelivered(row: RedemptionRow) {
    if (!user || row.status !== "pending" || updatingId !== null) return;

    setUpdatingId(row.id);
    setError("");

    const deliveredAt = new Date().toISOString();
    const { data, error: updateError } = await supabase
      .from("store_redemptions")
      .update({
        status: "delivered",
        delivered_at: deliveredAt,
        delivered_by: user.id,
        updated_at: deliveredAt,
      })
      .eq("id", row.id)
      .select("id,status,delivered_at,delivered_by")
      .single();

    setUpdatingId(null);

    if (updateError || !data) {
      console.warn("Unable to mark redemption delivered", updateError);
      setError(pick("Não foi possível marcar como entregue.", "Unable to mark as delivered."));
      return;
    }

    setRows(current => current.map(item => (
      item.id === row.id
        ? {
            ...item,
            status: "delivered",
            delivered_at: data.delivered_at,
            delivered_by: data.delivered_by,
          }
        : item
    )));
  }

  function formatDate(value: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  return (
    <>
      <Header />
      <main className="admin-redemptions-page">
        {access === "loading" || authLoading ? (
          <section className="admin-redemptions-state">
            <span className="admin-redemptions-loader" />
            <p>{pick("A verificar acesso…", "Checking access…")}</p>
          </section>
        ) : access === "denied" ? (
          <section className="admin-redemptions-state">
            <ShieldCheck />
            <h1>{pick("ACESSO RESTRITO", "RESTRICTED ACCESS")}</h1>
            <p>{pick("Este dashboard está disponível apenas para administradores.", "This dashboard is available to administrators only.")}</p>
            <a href={`${import.meta.env.BASE_URL}perfil`}>{pick("VOLTAR AO PERFIL", "BACK TO PROFILE")}</a>
          </section>
        ) : (
          <section className="admin-redemptions-shell">
            <header className="admin-redemptions-hero">
              <div>
                <span>{pick("ADMINISTRAÇÃO DA LOJA", "STORE ADMIN")}</span>
                <h1>{pick("RESGATES & ENTREGAS", "REDEMPTIONS & DELIVERIES")}</h1>
                <p>
                  {pick(
                    "Controla aqui tudo o que foi resgatado. A entrega é manual e só fica concluída quando um admin marcar o pedido como entregue.",
                    "Manage everything redeemed here. Fulfilment is manual and only completes when an admin marks the order as delivered."
                  )}
                </p>
              </div>
              <PackageCheck />
            </header>

            <div className="admin-redemptions-summary">
              <article>
                <ShoppingBag />
                <div><span>{pick("TOTAL", "TOTAL")}</span><strong>{counts.all}</strong></div>
              </article>
              <article className="pending">
                <Clock3 />
                <div><span>{pick("PENDENTES", "PENDING")}</span><strong>{counts.pending}</strong></div>
              </article>
              <article className="delivered">
                <CheckCircle2 />
                <div><span>{pick("ENTREGUES", "DELIVERED")}</span><strong>{counts.delivered}</strong></div>
              </article>
            </div>

            <div className="admin-redemptions-toolbar">
              <div className="admin-redemptions-filters">
                {(["all", "pending", "delivered"] as Filter[]).map(value => (
                  <button
                    key={value}
                    type="button"
                    className={filter === value ? "active" : ""}
                    onClick={() => setFilter(value)}
                  >
                    {value === "all"
                      ? pick("TODOS", "ALL")
                      : value === "pending"
                        ? pick("PENDENTES", "PENDING")
                        : pick("ENTREGUES", "DELIVERED")}
                    <b>{counts[value]}</b>
                  </button>
                ))}
              </div>
              <a href={`${import.meta.env.BASE_URL}perfil`}>{pick("VOLTAR AO PERFIL", "BACK TO PROFILE")}</a>
            </div>

            {error && <p className="admin-redemptions-error">{error}</p>}

            {loading ? (
              <section className="admin-redemptions-state compact">
                <span className="admin-redemptions-loader" />
                <p>{pick("A carregar resgates…", "Loading redemptions…")}</p>
              </section>
            ) : visibleRows.length === 0 ? (
              <section className="admin-redemptions-empty">
                <PackageCheck />
                <h2>{pick("AINDA NÃO HÁ RESGATES", "NO REDEMPTIONS YET")}</h2>
                <p>
                  {pick(
                    "Quando alguém resgatar uma skin, serviço ou código promocional, o pedido aparece aqui automaticamente como Pendente.",
                    "When someone redeems a skin, service or promo code, the request will automatically appear here as Pending."
                  )}
                </p>
              </section>
            ) : (
              <div className="admin-redemptions-list">
                {visibleRows.map(row => {
                  const delivered = row.status === "delivered";
                  const person = row.display_name || row.twitch_login || pick("Utilizador", "User");

                  return (
                    <article key={row.id} className={`admin-redemption-card ${delivered ? "delivered" : "pending"}`}>
                      <div className="admin-redemption-product">
                        <div className="admin-redemption-image">
                          {row.item_image_path ? (
                            <img src={asset(row.item_image_path)} alt={row.item_name} />
                          ) : (
                            <ShoppingBag />
                          )}
                        </div>
                        <div>
                          <span>{row.item_type.replace("_", " ").toUpperCase()}</span>
                          <h2>{row.item_name}</h2>
                          <small>#{row.id} · {formatDate(row.created_at)}</small>
                        </div>
                      </div>

                      <div className="admin-redemption-user">
                        <UserRound />
                        <div>
                          <span>{pick("RESGATADO POR", "REDEEMED BY")}</span>
                          <strong>{person}</strong>
                          {row.twitch_login && <small>@{row.twitch_login}</small>}
                        </div>
                      </div>

                      <div className="admin-redemption-cost">
                        <span>{pick("CUSTO", "COST")}</span>
                        <strong>{Number(row.chy_used).toLocaleString("pt-PT", { maximumFractionDigits: 2 })} CHY</strong>
                        {row.wp_used > 0 && <small>+ {Number(row.wp_used).toLocaleString("pt-PT")} WP</small>}
                      </div>

                      <div className="admin-redemption-action">
                        <span className={`admin-redemption-status ${row.status}`}>
                          {delivered ? <CheckCircle2 /> : <Clock3 />}
                          {delivered ? pick("ENTREGUE", "DELIVERED") : pick("PENDENTE", "PENDING")}
                        </span>

                        {delivered ? (
                          <small>{formatDate(row.delivered_at)}</small>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markDelivered(row)}
                            disabled={updatingId === row.id}
                          >
                            <CheckCircle2 />
                            {updatingId === row.id
                              ? pick("A ATUALIZAR…", "UPDATING…")
                              : pick("MARCAR ENTREGUE", "MARK DELIVERED")}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
