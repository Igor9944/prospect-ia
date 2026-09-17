import { PageHeader } from "../components/AppShell";

export default function Sequences() {
  return (
    <div>
      <PageHeader title="Séquences & Relances" subtitle="Personnalisez vos relances email générées dynamiquement par l'IA." />
      <div className="seq">
        <section className="card">
          <h3>Étapes de la séquence</h3>
          {[
            ["01", "Séquence Initiale", "Envoi immédiat", "EN COURS"],
            ["02", "Relance J+3", "Si pas de réponse", "+3 JOURS"],
            ["03", "Relance J+7", "Nouvel angle d'attaque", "+7 JOURS"],
            ["04", "Dernier rappel", "Clôture de boucle", "+14 J"],
          ].map(([n, t, d, tag]) => (
            <div key={n} className="step-item">
              <div className="row-between"><strong>{n} {t}</strong><span className="status status-info">{tag}</span></div>
              <small style={{ color: "#8e9bb3" }}>{d}</small>
            </div>
          ))}
          <button className="tab btn-full">Ajouter une étape</button>
        </section>
        <section className="card">
          <div className="row-between">
            <h3 style={{ margin: 0 }}>Éditeur d'email - Étape 1</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="tab">IA Générative</button>
              <button className="btn btn-primary">Enregistrer</button>
            </div>
          </div>
          <label className="field"><span>DE</span><input defaultValue="jean-marc@prospectai.fr" /></label>
          <label className="field"><span>À</span><input defaultValue="{{email}}" /></label>
          <label className="field"><span>OBJET</span><input defaultValue="Proposition d'automatisation IA pour {{entreprise}}" /></label>
          <div className="editor">
            Bonjour {"{{prénom}}"},
            <br /><br />
            J'ai analysé l'activité de {"{{entreprise}}"} et notre outil a détecté que vous pourriez automatiser une grande partie de vos process de ciblage.
            <br /><br />
            Avec votre score IA de {"{{score}}"}/10 sur votre entreprise, j'aimerais vous proposer une démo de 10 min.
            <br /><br />
            Bonne journée,<br />Jean-Marc
          </div>
        </section>
        <aside>
          <section className="metric"><small>Envoyés</small><div className="v" style={{ fontSize: 28 }}>245</div></section>
          <section className="metric"><small>Taux d'ouverture</small><div className="v" style={{ fontSize: 28 }}>68.2%</div><div className="progress"><span style={{ width: "68%" }} /></div></section>
          <section className="metric"><small>Taux de clic</small><div className="v" style={{ fontSize: 28 }}>24.5%</div></section>
          <section className="metric"><small>Taux de réponse</small><div className="v" style={{ fontSize: 28, color: "#34d399" }}>18.2%</div></section>
          <section className="metric"><small>Désinscriptions</small><div className="v" style={{ fontSize: 28, color: "#f87171" }}>1.4%</div></section>
        </aside>
      </div>
    </div>
  );
}
