import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, scoreColor, statusClass, type ProspectDto } from "../lib/api";

export default function ProspectDetail() {
  const { id } = useParams();
  const [row, setRow] = useState<ProspectDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.prospect(id).then(setRow).catch((err: Error) => setError(err.message));
  }, [id]);

  const run = async (kind: "score" | "remark") => {
    if (!id) return;
    setBusy(kind);
    setError(null);
    try {
      const next = kind === "score" ? await api.scoreProspect(id) : await api.remarkProspect(id);
      setRow(await api.prospect(id).catch(() => next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action IA impossible");
    } finally {
      setBusy(null);
    }
  };

  if (error) {
    return <p className="card" style={{ color: "#f87171" }}>{error}</p>;
  }
  if (!row) {
    return <p className="card">Chargement…</p>;
  }

  const site = row.website_url || (row.domain !== "non disponible" ? `https://${row.domain}` : null);

  return (
    <div>
      <div className="header">
        <div>
          <div style={{ color: "#8e9bb3", fontSize: 13 }}>Prospects › <strong style={{ color: "#fff" }}>{row.name}</strong></div>
        </div>
        <div className="header-actions">
          {site && (
            <a className="tab" href={site} target="_blank" rel="noreferrer">Site officiel</a>
          )}
          <button className="tab" disabled={busy !== null} onClick={() => run("remark")}>
            {busy === "remark" ? "Remarque…" : "Remarque Gemini"}
          </button>
          <button className="btn btn-primary" disabled={busy !== null} onClick={() => run("score")}>
            {busy === "score" ? "Scoring…" : "Rescorer avec Gemini"}
          </button>
        </div>
      </div>
      <section className="card detail-head">
        <div className="company">
          <span className="av" style={{ width: 56, height: 56, fontSize: 22 }}>{row.name[0]}</span>
          <div>
            <h2 style={{ margin: 0 }}>{row.name}</h2>
            <div className="chips" style={{ marginTop: 8 }}>
              <span className="chip">{row.domain}</span>
              <span className="chip">{row.sector}</span>
              <span className="chip">{row.size_category}</span>
              <span className="status status-ok">Score IA : {row.score.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, textAlign: "center" }}>
          <div><div style={{ fontSize: 24, fontWeight: 800 }}>{row.status}</div><small>Statut</small></div>
        </div>
      </section>
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr 280px", marginTop: 16 }}>
        <section className="card">
          <h3>Informations entreprise</h3>
          <p><small>SIÈGE / LOCALISATION</small><br />{row.location}</p>
          <p><small>CHIFFRE D'AFFAIRES</small><br />{row.revenue}</p>
          <p><small>FONDÉE EN</small><br />{row.founded_year ?? "non disponible"}</p>
          <p><small>DESCRIPTION</small><br />{row.description}</p>
        </section>
        <section className="card">
          <h3>Contacts identifiés</h3>
          <div className="company" style={{ marginBottom: 12 }}>
            <span className="av">{row.contact === "non disponible" ? "?" : row.contact.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{row.contact}</strong>
              <div style={{ color: "#8e9bb3", fontSize: 12 }}>
                {row.contact_role}<br />
                {row.email}<br />
                {row.phone}
              </div>
            </div>
          </div>
          <p style={{ color: "#8e9bb3", fontSize: 13 }}>
            Aucun email ou téléphone n’est inventé. Seules les valeurs publiques en base sont affichées.
          </p>
        </section>
        <section className="card" style={{ textAlign: "center" }}>
          <h3>Analyse & Scoring IA</h3>
          <div className="ring"><div><div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(row.score) }}>{row.score.toFixed(1)}</div><small>/10</small></div></div>
          <p style={{ color: "#34d399", fontWeight: 700 }}><span className={`status ${statusClass(row.status)}`}>{row.status}</span></p>
          <p style={{ textAlign: "left", fontSize: 13 }}>{row.justification}</p>
          <p style={{ textAlign: "left", fontSize: 13 }}>
            <strong style={{ color: "#34d399" }}>SIGNAUX POSITIFS</strong><br />
            {row.positive_signals.length ? row.positive_signals.join(" · ") : "non disponible"}
          </p>
          <p style={{ textAlign: "left", fontSize: 13 }}>
            <strong style={{ color: "#f87171" }}>SIGNAUX NÉGATIFS</strong><br />
            {row.negative_signals.length ? row.negative_signals.join(" · ") : "non disponible"}
          </p>
          <p style={{ textAlign: "left", fontSize: 13 }}>
            <strong>DONNÉES MANQUANTES</strong><br />
            {row.missing_data.length ? row.missing_data.join(" · ") : "non disponible"}
          </p>
        </section>
      </div>
      <section className="card" style={{ marginTop: 16 }}>
        <h3>Timeline des interactions</h3>
        {(row.interactions ?? []).length === 0 && (
          <p style={{ color: "#8e9bb3" }}>Aucune interaction enregistrée.</p>
        )}
        {(row.interactions ?? []).map((item) => (
          <div key={item.id} className="activity-item" style={{ padding: "10px 0" }}>
            <span className="av" style={{ width: 28, height: 28, fontSize: 11 }}>•</span>
            <div>
              <strong>{item.type}</strong>
              <div style={{ color: "#8e9bb3" }}>{item.content || "non disponible"}</div>
            </div>
            <small>{item.created_at}</small>
          </div>
        ))}
        <Link to="/app/prospects" style={{ color: "#8e9bb3" }}>← Retour aux prospects</Link>
      </section>
    </div>
  );
}
