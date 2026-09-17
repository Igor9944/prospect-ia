import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/AppShell";
import { api, statusClass, type CampaignDto } from "../lib/api";

const accents = ["#2e66f2", "#14a85c", "#db8f1f", "#56657f"];

export default function Campaigns() {
  const [rows, setRows] = useState<CampaignDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");

  useEffect(() => {
    api.campaigns()
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    if (filter === "Actives") return rows.filter((c) => c.status === "Active");
    if (filter === "En Pause") return rows.filter((c) => c.status === "En pause" || c.status === "Pause");
    if (filter === "Terminées") return rows.filter((c) => c.status === "Terminée");
    return rows;
  }, [filter, rows]);

  return (
    <div>
      <PageHeader title="Mes Campagnes" subtitle="Campagnes et volumes issus de Supabase — aucune donnée inventée." />
      <div className="tabs">
        {["Toutes", "Actives", "En Pause", "Terminées"].map((tab) => (
          <button key={tab} className={`tab ${filter === tab ? "on" : ""}`} onClick={() => setFilter(tab)}>
            {tab}
          </button>
        ))}
      </div>
      {error && <p className="card" style={{ color: "#f87171" }}>{error}</p>}
      {loading && <p className="card">Chargement des campagnes…</p>}
      {!loading && !error && rows.length === 0 && <p className="card">Aucune campagne en base.</p>}
      <div className="cards-3">
        {visible.map((c, i) => (
          <article key={c.id} className="card campaign" style={{ ["--accent" as string]: accents[i % accents.length] }}>
            <div className="row-between">
              <div>
                <strong>{c.name}</strong>
                <div style={{ color: c.status === "Active" ? "#10b981" : c.status === "En pause" ? "#fbbf24" : "#8e9bb3", fontSize: 12 }}>● {c.status}</div>
              </div>
              <span className={`status ${statusClass(c.status)}`}>{c.status}</span>
            </div>
            <div className="row-between" style={{ margin: "16px 0 8px", fontSize: 11, color: "#56657f" }}>
              <span>PROGRESSION</span><span>{c.progress}%</span>
            </div>
            <div className="progress"><span style={{ width: `${c.progress}%` }} /></div>
            <div className="mini-stats">
              <div><div className="k">Prospects</div><strong>{c.prospects}</strong></div>
              <div><div className="k">Contactés</div><strong>{c.sent}</strong></div>
              <div>
                <div className="k">Réponses</div>
                <strong style={{ color: "#34d399" }}>
                  {c.reply_rate === null ? "non disponible" : `${c.reply_rate}%`}
                </strong>
              </div>
            </div>
            <div className="row-between" style={{ fontSize: 12, color: "#8e9bb3" }}>
              <span>Créé le {c.date}</span>
              <Link to={`/app/prospects?campaign=${c.id}`}>Voir détails →</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
