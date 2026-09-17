import { useEffect, useState } from "react";
import { PageHeader } from "../components/AppShell";
import { api, type StatsDto } from "../lib/api";

export default function Stats() {
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch((err: Error) => setError(err.message));
  }, []);

  const maxBar = Math.max(1, ...(stats?.score_histogram ?? [1]));

  return (
    <div>
      <PageHeader
        title="Rapport & Statistiques"
        subtitle="Indicateurs calculés sur les lignes réellement présentes dans Supabase."
      />
      {error && <p className="card" style={{ color: "#f87171" }}>{error}</p>}
      <div className="kpis">
        {[
          ["Prospects totaux", String(stats?.total_prospects ?? "—")],
          ["Campagnes", String(stats?.total_campaigns ?? "—")],
          ["Score moyen", stats ? `${stats.average_score}/10` : "—"],
          ["Taux de conversion", stats ? `${stats.conversion_rate}%` : "—"],
        ].map(([l, v]) => (
          <article key={l} className="kpi">
            <div className="top">{l}</div>
            <div className="v">{v}</div>
          </article>
        ))}
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h3>Distribution des scores IA (0–9)</h3>
          <div className="hist">
            {(stats?.score_histogram ?? []).map((count, i) => (
              <i key={i} title={`${i}–${i + 1} : ${count}`} style={{ height: Math.max(8, (count / maxBar) * 110) }} />
            ))}
          </div>
        </section>
        <section className="card">
          <h3>Performance par campagne</h3>
          {(stats?.campaigns ?? []).map((c, i) => (
            <div key={c.id} className="row-between" style={{ padding: "10px 0" }}>
              <span>0{i + 1} {c.name}</span>
              <strong style={{ color: "#34d399" }}>{c.qualified}/{c.prospects} qualifiés</strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
