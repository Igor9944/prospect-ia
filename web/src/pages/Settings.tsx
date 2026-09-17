import { Avatar } from "../components/Brand";
import { PageHeader } from "../components/AppShell";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Paramètres globaux" subtitle="Gérez les réglages de votre compte, de vos automatisations IA et de votre équipe commerciale." />
      <section className="card">
        <div className="row-between"><h3 style={{ margin: 0 }}>Votre profil commercial</h3><span className="status status-ok">Compte actif</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 1fr 1fr", gap: 16, marginTop: 16, alignItems: "center" }}>
          <Avatar size={56} />
          <label className="field"><span>Nom complet</span><input defaultValue="Jean-Marc Alix" /></label>
          <label className="field"><span>Adresse email</span><input defaultValue="jean-marc.alix@prospectai.com" /></label>
          <label className="field"><span>Rôle</span><input defaultValue="Dir. Commercial" /></label>
        </div>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h3>Connexions & Intégrations API</h3>
        {[
          ["Google Sheets", "Exportation et centralisation automatique de vos listes qualifiées.", true],
          ["Gmail & Google Workspace", "Envoi de séquences personnalisées depuis vos boîtes professionnelles.", true],
          ["n8n Automation Engine", "Déclenchement automatique des scénarios dès qu'un lead atteint un certain score.", true],
          ["Google Gemini", "Scoring 0-10 et remarques commerciales à partir des données publiques.", true],
          ["LinkedIn Sales Navigator", "Enrichissement de profils et ciblage de décideurs en direct.", false],
        ].map(([n, d, on]) => (
          <div key={String(n)} className="setting-row">
            <div>
              <strong>{n}</strong>
              <div style={{ color: "#8e9bb3", fontSize: 13 }}>{d}</div>
            </div>
            <button className={`switch${on ? "" : " off"}`} type="button" aria-label={String(n)} />
          </div>
        ))}
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h3>Alertes & Notifications d'Activité</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {["Rapports quotidiens par email", "Nouveau prospect qualifié (Scoring > 8)", "Alertes Slack instantanées", "Résumé statistique hebdomadaire"].map((l, i) => (
            <div key={l} className="setting-row">
              <span>{l}</span>
              <button className={`switch${i === 3 ? " off" : ""}`} type="button" />
            </div>
          ))}
        </div>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <div className="row-between">
          <h3 style={{ margin: 0 }}>Membres de l'équipe (3)</h3>
          <button className="btn btn-primary">Inviter un membre</button>
        </div>
        {[
          ["Jean-Marc Alix", "j.alix@prospectai.com", "Admin"],
          ["Aurélie Masson", "a.masson@prospectai.com", "Commercial"],
          ["Sébastien Brun", "s.brun@prospectai.com", "Analyst"],
        ].map(([n, e, r]) => (
          <div key={n} className="setting-row">
            <div><strong>{n}</strong><div style={{ color: "#8e9bb3" }}>{e}</div></div>
            <span className="status status-ok">{r}</span>
          </div>
        ))}
      </section>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <button className="tab">Annuler</button>
        <button className="btn btn-primary">Sauvegarder les modifications</button>
      </div>
    </div>
  );
}
