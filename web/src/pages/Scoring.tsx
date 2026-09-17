import { useEffect, useState } from "react";
import { PageHeader } from "../components/AppShell";
import { api, type ProspectDto, type StatsDto } from "../lib/api";

export default function Scoring() {
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [top, setTop] = useState<ProspectDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const maxBar = Math.max(1, ...(stats?.score_histogram ?? [1]));

  const refresh = () =>
    Promise.all([api.stats(), api.prospects()]).then(([nextStats, prospects]) => {
      setStats(nextStats);
      setTop([...prospects].sort((a, b) => b.score - a.score).slice(0, 3));
    });

  useEffect(() => {
    refresh().catch((err: Error) => setError(err.message));
  }, []);

  const runScoring = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const payload = await api.scoreAll();
      const failed = payload.errors.length;
      setResult(`${payload.scored} prospects scorés par Gemini${failed ? ` — ${failed} erreur(s)` : ""}.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring impossible");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <PageHeader title="Configuration du Scoring" subtitle="Les scores et remarques sont produits par Google Gemini à partir des données publiques en base." />
      {error && <p className="card" style={{ color: "#f87171" }}>{error}</p>}
      {result && <p className="card" style={{ color: "#34d399" }}>{result}</p>}
      <div className="grid-2">
        <section className="card">
          <div className="row-between"><h3 style={{ margin: 0 }}>Critères de ciblage</h3><span className="status status-info">Gemini</span></div>
          <label className="field" style={{ marginTop: 16 }}>
            <span>Secteur d'activité</span>
            <input defaultValue="Santé, Fintech, RH / Paie" />
          </label>
          <p>Mots-clés recherchés</p>
          <div className="chips">
            {["santé", "paiement", "paie", "B2B"].map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
          <label className="field" style={{ marginTop: 16 }}>
            <span>Zone géographique</span>
            <input defaultValue="France" />
          </label>
          <p>Score IA minimum <strong style={{ float: "right" }}>7.0</strong></p>
          <div className="progress"><span style={{ width: "70%", background: "linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)" }} /></div>
          <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={running} onClick={runScoring}>
            {running ? "Scoring Gemini en cours…" : "Lancer le scoring IA"}
          </button>
        </section>
        <div>
          <div className="kpis" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <article className="kpi"><div className="top">Score moyen réel</div><div className="v">{stats?.average_score ?? "—"} <small>/10</small></div></article>
            <article className="kpi"><div className="top">Volume en base</div><div className="v">{stats?.total_prospects ?? "—"}</div></article>
          </div>
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Distribution des scores IA</h3>
            <div className="hist">
              {(stats?.score_histogram ?? []).map((count, i) => (
                <i key={i} style={{ height: Math.max(8, (count / maxBar) * 110), background: i < 3 ? "#ef4444" : i < 6 ? "#84cc16" : "#3b82f6" }} />
              ))}
            </div>
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Top 3 - Aperçu des prospects</h3>
            {top.map((p, i) => (
              <div key={p.id} className="row-between" style={{ padding: "8px 0" }}>
                <span>{i + 1}. {p.name}</span><span className="status status-ok">{p.score.toFixed(1)} {p.status}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
