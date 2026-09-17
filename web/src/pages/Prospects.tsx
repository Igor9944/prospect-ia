import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Brand";
import { PageHeader } from "../components/AppShell";
import { api, scoreColor, statusClass, type ProspectDto, type StatsDto } from "../lib/api";

export default function Prospects() {
  const [params] = useSearchParams();
  const campaignId = params.get("campaign") ?? undefined;
  const [rows, setRows] = useState<ProspectDto[]>([]);
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.prospects(campaignId), api.stats()])
      .then(([prospects, nextStats]) => {
        setRows(prospects);
        setStats(nextStats);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const kpis = useMemo(() => {
    const avg = rows.length
      ? (rows.reduce((sum, r) => sum + r.score, 0) / rows.length).toFixed(1)
      : stats
        ? stats.average_score.toFixed(1)
        : "0.0";
    return [
      { label: "Prospects Trouvés", value: String(rows.length), note: "Base Supabase", icon: "/assets/icon-target.svg" },
      { label: "Score Moyen IA", value: `${avg}/10`, note: "Scores enregistrés", icon: "/assets/icon-sparkles.svg" },
      { label: "Contactés", value: String(stats?.contacted ?? rows.filter((r) => ["Contacté", "Relancé", "Répondu", "Converti", "Gagné"].includes(r.status)).length), note: "Statuts réels", icon: "/assets/icon-mail-nav.svg" },
      { label: "Taux de conversion", value: `${stats?.conversion_rate ?? 0}%`, note: "Converti / total", icon: "/assets/icon-mail.svg" },
    ];
  }, [rows, stats]);

  return (
    <div>
      <PageHeader title="Dashboard Prospect Intelligence" subtitle="Entreprises publiques françaises en base — emails non publiés affichés « non disponible »." />
      {error && <p className="card" style={{ color: "#f87171" }}>{error}</p>}
      <div className="kpis">
        {kpis.map((k) => (
          <article key={k.label} className="kpi">
            <div className="top">
              {k.label}
              <span className="ico-wrap"><Icon src={k.icon} size={22} /></span>
            </div>
            <div className="v">{k.value}</div>
            <div className="up">{k.note}</div>
          </article>
        ))}
      </div>
      <div className="grid-2">
        <section className="card">
          <div className="row-between">
            <h3 style={{ margin: 0 }}>Prospects Identifiés & Enrichis</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Entreprise</th><th>Contact principal</th><th>Score IA</th><th>Statut</th><th>Dernière action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link className="company" to={`/app/prospects/${r.prospect_id}`}>
                      <span className="av">{r.name[0]}</span>
                      <span>
                        <strong>{r.name}</strong>
                        <div style={{ color: "#8e9bb3" }}>{r.domain}</div>
                      </span>
                    </Link>
                  </td>
                  <td>{r.contact}</td>
                  <td>
                    {r.score.toFixed(1)}
                    <span className="score-bar"><span style={{ width: `${r.score * 10}%`, background: scoreColor(r.score) }} /></span>
                  </td>
                  <td><span className={`status ${statusClass(r.status)}`}>{r.status}</span></td>
                  <td style={{ color: "#8e9bb3" }}>{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p style={{ color: "#8e9bb3" }}>Chargement…</p>}
          {!loading && rows.length === 0 && !error && <p style={{ color: "#8e9bb3" }}>Aucun prospect en base.</p>}
        </section>
        <aside>
          <section className="card">
            <h3 style={{ marginTop: 0 }}>Répartition des statuts</h3>
            <p style={{ color: "#8e9bb3", fontSize: 13 }}>Comptages Supabase, sans activité simulée.</p>
            <div className="activity">
              {Object.entries(stats?.statuses ?? {}).map(([status, count]) => (
                <div key={status} className="activity-item">
                  <Icon src="/assets/icon-target.svg" size={16} />
                  <div>
                    <strong>{status}</strong>
                    <small>{count} prospect{count > 1 ? "s" : ""}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <div className="row-between"><strong>Source des données</strong><span className="status status-ok">Supabase</span></div>
            <div className="row-between" style={{ marginTop: 12 }}><span>Projet</span><strong>prospect-ia</strong></div>
            <div className="row-between"><span>Emails inventés</span><strong style={{ color: "#34d399" }}>0</strong></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
